import { useUser, useOrganization, UserButton, RedirectToSignIn } from "@clerk/clerk-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import SchemaConverterApp from "@schema-converter";
import { SCHEMA_CONVERTER_PAGES } from "@schema-converter/pages";
import DiscoSheetApp from "../apps/DiscoSheetApp";
import SettingsApp from "../apps/SettingsApp";
import { loadServiceSettings } from "../serviceConfig";

type MenuItem = { label: string; href: string };

const SCHEMA_CONVERTER_BASE = "/dashboard/schema-converter";
const DISCOSHEET_BASE = "/dashboard/discosheet";
const SETTINGS_BASE = "/dashboard/settings";

const SCHEMA_CONVERTER_MENU: MenuItem[] = SCHEMA_CONVERTER_PAGES.map((page) => ({
  label: page.label,
  href: `${SCHEMA_CONVERTER_BASE}/${page.path}`,
}));

const ROLE_MENU: Record<string, MenuItem[]> = {
  "org:admin": [
    { label: "🏠 Home",         href: "/dashboard" },
    { label: "👥 Manage Users", href: "/dashboard/users" },
    { label: "📊 Reports",      href: "/dashboard/reports" },
    { label: "📝 discoSheet",   href: DISCOSHEET_BASE },
    { label: "⚙️ Settings",     href: "/dashboard/settings" },
  ],
  "org:member": [
    { label: "🏠 Home",         href: "/dashboard" },
    { label: "✏️ Edit Content", href: "/dashboard/content" },
    { label: "📊 Reports",      href: "/dashboard/reports" },
  ],
  "org:guest": [
    { label: "🏠 Home",         href: "/dashboard" },
    { label: "📊 Reports",      href: "/dashboard/reports" },
  ],
};

const ROLE_LABEL: Record<string, string> = {
  "org:admin":  "Admin",
  "org:member": "Member",
  "org:guest":  "Guest",
};

export default function Dashboard() {
  const { isLoaded: userLoaded, isSignedIn, user } = useUser();
  const { isLoaded: orgLoaded, membership } = useOrganization();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSchemaMenuOpen, setIsSchemaMenuOpen] = useState(() =>
    location.pathname.startsWith(SCHEMA_CONVERTER_BASE)
  );
  const [serviceSettings, setServiceSettings] = useState(loadServiceSettings);

  if (!userLoaded || !orgLoaded) return <div style={styles.loading}>Loading...</div>;
  if (!isSignedIn) return <RedirectToSignIn />;

  const role = membership?.role ?? "org:guest";
  const menuItems = ROLE_MENU[role] ?? ROLE_MENU["org:guest"];
  const roleLabel = ROLE_LABEL[role] ?? role;
  const isSchemaConverterRoute = location.pathname.startsWith(SCHEMA_CONVERTER_BASE);
  const isDiscoSheetRoute = location.pathname.startsWith(DISCOSHEET_BASE);
  const isSettingsRoute = location.pathname.startsWith(SETTINGS_BASE);
  const schemaConverterPath = location.pathname.replace(`${SCHEMA_CONVERTER_BASE}/`, "");
  const schemaConverterPage =
    SCHEMA_CONVERTER_PAGES.find((page) => page.path === schemaConverterPath) ??
    SCHEMA_CONVERTER_PAGES[0];

  function isActiveRoute(href: string) {
    if (href === "/dashboard") return location.pathname === href;
    return location.pathname === href || location.pathname.startsWith(`${href}/`);
  }

  function handleSchemaConverterPageChange(pageId: string) {
    const page = SCHEMA_CONVERTER_PAGES.find((item) => item.id === pageId);
    if (page) navigate(`${SCHEMA_CONVERTER_BASE}/${page.path}`);
  }

  function shouldShowSchemaMenuAfter(item: MenuItem) {
    if (role === "org:admin") return item.href === "/dashboard/users";
    return item.href === "/dashboard";
  }

  const schemaConverterNav = (
    <div style={styles.navGroup}>
      <button
        type="button"
        aria-expanded={isSchemaMenuOpen}
        onClick={() => setIsSchemaMenuOpen((isOpen) => !isOpen)}
        style={{
          ...styles.navItem,
          ...styles.parentNavItem,
          ...(isSchemaConverterRoute ? styles.activeNavItem : {}),
        }}
      >
        <span style={styles.parentNavLabel}>🧩 Schema Converter</span>
        <span aria-hidden="true" style={styles.parentNavToggle}>{isSchemaMenuOpen ? "−" : "+"}</span>
      </button>
      {isSchemaMenuOpen && (
        <div style={styles.subNav}>
          {SCHEMA_CONVERTER_MENU.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              style={{
                ...styles.navItem,
                ...styles.subNavItem,
                ...(isActiveRoute(item.href) ? styles.activeSubNavItem : {}),
              }}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div style={styles.layout}>
      <aside style={styles.sidebar}>
        <div style={styles.brand}>
          rogerioignacio<span style={styles.dot}>.com</span>
        </div>
        <nav style={styles.nav}>
          {menuItems.map((item) => (
            <div key={item.href}>
              <Link
                to={item.href}
                style={{
                  ...styles.navItem,
                  ...(isActiveRoute(item.href) ? styles.activeNavItem : {}),
                }}
              >
                {item.label}
              </Link>
              {shouldShowSchemaMenuAfter(item) && schemaConverterNav}
            </div>
          ))}
        </nav>
        <div style={styles.sidebarFooter}>
          <span style={styles.roleTag}>{roleLabel}</span>
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                userButtonAvatarBox: "lp-ub-avatar",
                userButtonPopoverCard: "lp-ub-popover",
                userButtonPopoverActionButton: "lp-ub-action",
              },
            }}
          />
        </div>
      </aside>
      <main style={styles.main}>
        {isSchemaConverterRoute && schemaConverterPage ? (
          <SchemaConverterApp
            embedded
            activePage={schemaConverterPage.id}
            apiBaseUrl={serviceSettings.schemaConverterApiUrl}
            onPageChange={handleSchemaConverterPageChange}
          />
        ) : isDiscoSheetRoute && role === "org:admin" ? (
          <DiscoSheetApp apiBaseUrl={serviceSettings.discoSheetApiUrl} />
        ) : isSettingsRoute && role === "org:admin" ? (
          <SettingsApp settings={serviceSettings} onSettingsChange={setServiceSettings} />
        ) : (
          <>
            <h1 style={styles.heading}>
              Welcome, {user.firstName ?? user.emailAddresses[0].emailAddress} 👋
            </h1>
            <p style={styles.subtext}>You are signed in as <strong>{roleLabel}</strong>.</p>
          </>
        )}
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  layout:        { display:"flex", minHeight:"100svh", background:"#0B1220", color:"#E2E8F0", fontFamily:"system-ui, -apple-system, Segoe UI, Roboto, sans-serif" },
  sidebar:       { width:"240px", background:"#0A1020", borderRight:"1px solid #1E293B", display:"flex", flexDirection:"column", padding:"1.5rem 1rem", gap:"1rem" },
  brand:         { fontSize:"1.1rem", color:"#FFFFFF", marginBottom:"1rem", fontWeight:700, letterSpacing:"-0.01em" },
  dot:           { color:"#60A5FA" },
  nav:           { display:"flex", flexDirection:"column", gap:"0.4rem", flex:1 },
  navItem:       { color:"#CBD5E1", textDecoration:"none", padding:"0.55rem 0.75rem", borderRadius:"10px", fontSize:"0.9rem", border:"1px solid transparent" },
  navGroup:      { display:"flex", flexDirection:"column", gap:"0.3rem" },
  parentNavItem: { marginTop:"0.35rem", fontWeight:700, width:"100%", background:"transparent", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"flex-start", gap:"0.45rem", fontFamily:"inherit", textAlign:"left" },
  parentNavLabel: { display:"inline-flex", alignItems:"center", gap:"0.45rem" },
  parentNavToggle: { marginLeft:"auto" },
  subNav:        { display:"flex", flexDirection:"column", gap:"0.25rem", marginLeft:"0.8rem", paddingLeft:"0.65rem", borderLeft:"1px solid rgba(148, 163, 184, 0.22)" },
  subNavItem:    { fontSize:"0.82rem", padding:"0.45rem 0.65rem" },
  activeNavItem: { background:"rgba(96, 165, 250, 0.14)", color:"#FFFFFF", border:"1px solid rgba(96, 165, 250, 0.28)" },
  activeSubNavItem: { background:"rgba(96, 165, 250, 0.1)", color:"#FFFFFF", border:"1px solid rgba(96, 165, 250, 0.22)" },
  sidebarFooter: { display:"flex", alignItems:"center", justifyContent:"space-between", paddingTop:"1rem", borderTop:"1px solid #1E293B" },
  roleTag:       { background:"rgba(96, 165, 250, 0.12)", color:"#60A5FA", fontSize:"0.75rem", padding:"4px 10px", borderRadius:"999px", textTransform:"uppercase", border:"1px solid rgba(96, 165, 250, 0.25)" },
  main:          { flex:1, padding:"2.5rem" },
  heading:       { fontSize:"2rem", marginBottom:"0.5rem", color:"#FFFFFF", letterSpacing:"-0.02em" },
  subtext:       { color:"#94A3B8" },
  loading:       { color:"#E2E8F0", padding:"2rem" },
};
