import { Navigate } from "react-router-dom";

// Usage :
//   <ProtectedRoute><PatientLayout /></ProtectedRoute>                     → juste connecté
//   <ProtectedRoute allowedRoles={["medecin"]}><DashboardMedecin /></ProtectedRoute>  → connecté + rôle précis
function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // Pas connecté du tout → redirection vers la page de connexion
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Connecté mais mauvais rôle (ex: patient qui tape /admin dans l'URL)
  // → on le renvoie vers SON propre espace plutôt qu'un simple refus,
  // pour éviter une page blanche déroutante.
  if (allowedRoles && !allowedRoles.includes(role)) {
    const redirections = {
      patient: "/patient",
      medecin: "/medecin",
      admin: "/admin",
    };
    return <Navigate to={redirections[role] || "/login"} replace />;
  }

  return children;
}

export default ProtectedRoute;