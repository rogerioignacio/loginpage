import { useUser, useOrganization, UserButton, RedirectToSignIn } from "@clerk/clerk-react";
import type { ComponentType, CSSProperties } from "react";
import { useState } from "react";
import { Blocks, ChartNoAxesColumn, FileText, House, Pencil, Settings, Users } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import SchemaConverterApp from "@schema-converter";
import { SCHEMA_CONVERTER_PAGES } from "@schema-converter/pages";
import DiscoSheetApp from "../apps/DiscoSheetApp";
import SettingsApp from "../apps/SettingsApp";
import { loadServiceSettings } from "../serviceConfig";

type MenuIcon = ComponentType<{ size?: number; strokeWidth?: number }>;
type MenuItem = { label: string; href: string; icon?: MenuIcon };

const SCHEMA_CONVERTER_BASE = "/dashboard/schema-converter";
const DISCOSHEET_BASE = "/dashboard/discosheet";
const SETTINGS_BASE = "/dashboard/settings";

const SCHEMA_CONVERTER_MENU: MenuItem[] = SCHEMA_CONVERTER_PAGES.map((page) => ({
  label: page.label,
  href: `${SCHEMA_CONVERTER_BASE}/${page.path}`,
}));

const ROLE_MENU: Record<string, MenuItem[]> = {
  "org:admin": [
    { label: "Home",         href: "/dashboard", icon: House },
    { label: "Manage Users", href: "/dashboard/users", icon: Users },
    { label: "Reports",      href: "/dashboard/reports", icon: ChartNoAxesColumn },
    { label: "discoSheet",   href: DISCOSHEET_BASE, icon: FileText },
    { label: "Settings",     href: "/dashboard/settings", icon: Settings },
  ],
  "org:member": [
    { label: "Home",         href: "/dashboard", icon: House },
    { label: "Edit Content", href: "/dashboard/content", icon: Pencil },
    { label: "Reports",      href: "/dashboard/reports", icon: ChartNoAxesColumn },
  ],
  "org:guest": [
    { label: "Home",         href: "/dashboard", icon: House },
    { label: "Reports",      href: "/dashboard/reports", icon: ChartNoAxesColumn },
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
        className="lp-nav-item"
        style={{
          ...styles.navItem,
          ...styles.parentNavItem,
          ...(isSchemaConverterRoute ? styles.activeNavItem : {}),
        }}
      >
        <span style={styles.parentNavLabel}><Blocks size={17} strokeWidth={1.9} /> Schema Converter</span>
        <span aria-hidden="true" style={styles.parentNavToggle}>{isSchemaMenuOpen ? "−" : "+"}</span>
      </button>
      {isSchemaMenuOpen && (
        <div style={styles.subNav}>
          {SCHEMA_CONVERTER_MENU.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className="lp-nav-item"
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
    <div className="lp-dashboard-layout" style={styles.layout}>
      <aside className="lp-sidebar" style={styles.sidebar}>
        <div style={styles.brand}>
          rogerioignacio<span style={styles.dot}>.com</span>
        </div>
        <nav style={styles.nav}>
          {menuItems.map((item) => (
            <div key={item.href}>
              {item.icon && (
              <Link
                to={item.href}
                className="lp-nav-item"
                style={{
                  ...styles.navItem,
                  ...(isActiveRoute(item.href) ? styles.activeNavItem : {}),
                }}
              >
                <item.icon size={17} strokeWidth={1.9} />
                <span>{item.label}</span>
              </Link>
              )}
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
      <main className="lp-main" style={styles.main}>
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

const styles: Record<string, CSSProperties> = {
  layout:        { display:"flex", minHeight:"100svh", background:"#F7FAF9", color:"#102A2A", fontFamily:"Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif" },
  sidebar:       { width:"264px", background:"rgba(255, 255, 255, 0.9)", borderRight:"1px solid #E2E8F0", display:"flex", flexDirection:"column", padding:"1.35rem 1rem", gap:"1.25rem", boxShadow:"10px 0 30px rgba(15, 23, 42, 0.03)", backdropFilter:"blur(12px)" },
  brand:         { fontSize:"1.02rem", color:"#102A2A", marginBottom:"0.35rem", fontWeight:800, letterSpacing:"-0.02em" },
  dot:           { color:"#0F8F87" },
  nav:           { display:"flex", flexDirection:"column", gap:"0.4rem", flex:1 },
  navItem:       { color:"#475569", textDecoration:"none", padding:"0.68rem 0.75rem", borderRadius:"12px", fontSize:"0.9rem", border:"1px solid transparent", display:"flex", alignItems:"center", gap:"0.65rem", fontWeight:650, transition:"background 160ms ease, color 160ms ease, border-color 160ms ease" },
  navGroup:      { display:"flex", flexDirection:"column", gap:"0.3rem" },
  parentNavItem: { marginTop:"0.35rem", width:"100%", background:"transparent", cursor:"pointer", justifyContent:"flex-start", fontFamily:"inherit", textAlign:"left" },
  parentNavLabel: { display:"inline-flex", alignItems:"center", gap:"0.65rem" },
  parentNavToggle: { marginLeft:"auto" },
  subNav:        { display:"flex", flexDirection:"column", gap:"0.25rem", marginLeft:"0.75rem", paddingLeft:"0.7rem", borderLeft:"1px solid #E2E8F0" },
  subNavItem:    { fontSize:"0.82rem", padding:"0.45rem 0.65rem" },
  activeNavItem: { background:"#E6F7F5", color:"#0F766E", border:"1px solid rgba(13, 148, 136, 0.18)" },
  activeSubNavItem: { background:"rgba(230, 247, 245, 0.72)", color:"#0F766E", border:"1px solid rgba(13, 148, 136, 0.14)" },
  sidebarFooter: { display:"flex", alignItems:"center", justifyContent:"space-between", paddingTop:"1rem", borderTop:"1px solid #E2E8F0" },
  roleTag:       { background:"#E6F7F5", color:"#0F766E", fontSize:"0.72rem", padding:"4px 10px", borderRadius:"999px", textTransform:"uppercase", border:"1px solid rgba(13, 148, 136, 0.18)", fontWeight:800, letterSpacing:"0.06em" },
  main:          { flex:1, padding:"2.25rem", overflowX:"hidden" },
  heading:       { fontSize:"2rem", marginBottom:"0.5rem", color:"#102A2A", letterSpacing:"-0.02em" },
  subtext:       { color:"#64748B" },
  loading:       { color:"#102A2A", padding:"2rem", background:"#F7FAF9" },
};
