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
        <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"#0d0d0d"}}>
          <h1 style={{fontFamily:"Georgia,serif",color:"#f0ece4",fontSize:"2.5rem",marginBottom:"1.5rem"}}>
            rogerioignacio<span style={{color:"#e8c97e"}}>.com</span>
          </h1>
          <SignedOut><SignIn afterSignInUrl="/dashboard" /></SignedOut>
          <SignedIn><Navigate to="/dashboard" replace /></SignedIn>
        </div>
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
