import { Routes, Route, Navigate } from "react-router-dom";
import { SignedIn, SignedOut, SignIn, useOrganizationList } from "@clerk/clerk-react";
import Dashboard from "./pages/Dashboard";

function AutoActivateOrg({ children }: { children: React.ReactNode }) {
  const { isLoaded, userMemberships, setActive } = useOrganizationList({
    userMemberships: { infinite: true },
  });

  // Auto-activate the first org if none is active
  if (isLoaded && userMemberships?.data?.length > 0) {
    const firstOrg = userMemberships.data[0];
    if (firstOrg) {
      setActive({ organization: firstOrg.organization.id });
    }
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={
        <main style={styles.page}>
          <section style={styles.container}>
            <header style={styles.header}>
              <h1 style={styles.brand}>
                rogerioignacio<span style={styles.brandAccent}>.com</span>
              </h1>
              <p style={styles.subtitle}>Secure access to your workspace</p>
            </header>

            <SignedOut>
              <SignIn
                afterSignInUrl="/dashboard"
                appearance={{
                  elements: {
                    rootBox: "lp-clerk-rootBox",
                    card: "lp-clerk-card",
                    headerTitle: "lp-clerk-headerTitle",
                    headerSubtitle: "lp-clerk-headerSubtitle",
                    socialButtonsBlockButton: "lp-clerk-socialButton",
                    formButtonPrimary: "lp-clerk-primaryButton",
                    footerActionLink: "lp-clerk-footerLink",
                  },
                }}
              />
            </SignedOut>
            <SignedIn><Navigate to="/dashboard" replace /></SignedIn>
          </section>
        </main>
      } />
      <Route path="/dashboard/*" element={
        <SignedIn>
          <AutoActivateOrg>
            <Dashboard />
          </AutoActivateOrg>
        </SignedIn>
      } />
    </Routes>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100svh",
    background: "#0B1220",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
  },
  container: {
    width: "100%",
    maxWidth: 420,
  },
  header: {
    textAlign: "center",
    marginBottom: 32,
  },
  brand: {
    margin: 0,
    color: "#ffffff",
    fontSize: "40px",
    fontWeight: 700,
    letterSpacing: "-0.02em",
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
  },
  brandAccent: {
    color: "#60A5FA",
  },
  subtitle: {
    marginTop: 12,
    color: "#94A3B8",
    fontSize: 16,
  },
};
