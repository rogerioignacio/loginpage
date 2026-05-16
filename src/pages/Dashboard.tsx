import { useUser, useOrganization, UserButton, RedirectToSignIn } from "@clerk/clerk-react";

const ROLE_MENU: Record<string, { label: string; href: string }[]> = {
  "org:admin": [
    { label: "🏠 Home",         href: "/dashboard" },
    { label: "👥 Manage Users", href: "/dashboard/users" },
    { label: "⚙️ Settings",     href: "/dashboard/settings" },
    { label: "📊 Reports",      href: "/dashboard/reports" },
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

  if (!userLoaded || !orgLoaded) return <div style={styles.loading}>Loading...</div>;
  if (!isSignedIn) return <RedirectToSignIn />;

  const role = membership?.role ?? "org:guest";
  const menuItems = ROLE_MENU[role] ?? ROLE_MENU["org:guest"];
  const roleLabel = ROLE_LABEL[role] ?? role;

  return (
    <div style={styles.layout}>
      <aside style={styles.sidebar}>
        <div style={styles.brand}>
          rogerioignacio<span style={styles.dot}>.com</span>
        </div>
        <nav style={styles.nav}>
          {menuItems.map((item) => (
            <a key={item.href} href={item.href} style={styles.navItem}>
              {item.label}
            </a>
          ))}
        </nav>
        <div style={styles.sidebarFooter}>
          <span style={styles.roleTag}>{roleLabel}</span>
          <UserButton afterSignOutUrl="/" />
        </div>
      </aside>
      <main style={styles.main}>
        <h1 style={styles.heading}>
          Welcome, {user.firstName ?? user.emailAddresses[0].emailAddress} 👋
        </h1>
        <p style={styles.subtext}>You are signed in as <strong>{roleLabel}</strong>.</p>
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  layout:        { display:"flex", minHeight:"100vh", background:"#0d0d0d", color:"#f0ece4", fontFamily:"DM Sans, system-ui, sans-serif" },
  sidebar:       { width:"220px", background:"#111", borderRight:"1px solid #222", display:"flex", flexDirection:"column", padding:"1.5rem 1rem", gap:"1rem" },
  brand:         { fontFamily:"Georgia, serif", fontSize:"1.1rem", color:"#f0ece4", marginBottom:"1rem" },
  dot:           { color:"#e8c97e" },
  nav:           { display:"flex", flexDirection:"column", gap:"0.4rem", flex:1 },
  navItem:       { color:"#ccc", textDecoration:"none", padding:"0.5rem 0.75rem", borderRadius:"6px", fontSize:"0.9rem" },
  sidebarFooter: { display:"flex", alignItems:"center", justifyContent:"space-between", paddingTop:"1rem", borderTop:"1px solid #222" },
  roleTag:       { background:"#1e1e1e", color:"#e8c97e", fontSize:"0.75rem", padding:"2px 8px", borderRadius:"999px", textTransform:"uppercase" },
  main:          { flex:1, padding:"2.5rem" },
  heading:       { fontFamily:"Georgia, serif", fontSize:"2rem", marginBottom:"0.5rem" },
  subtext:       { color:"#888" },
  loading:       { color:"#f0ece4", padding:"2rem" },
};
