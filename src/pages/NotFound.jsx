import { useNavigate } from "react-router-dom";

function NotFound() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        gap: "1rem",
        padding: "2rem",
      }}
    >
      <h1 style={{ fontSize: "4rem", margin: 0 }}>404</h1>
      <p style={{ fontSize: "1.2rem", color: "#555" }}>
        La page que vous cherchez n'existe pas.
      </p>
      <button
        onClick={() => navigate("/")}
        style={{
          padding: "0.75rem 1.5rem",
          borderRadius: "8px",
          border: "none",
          background: "#2563eb",
          color: "#fff",
          cursor: "pointer",
          fontSize: "1rem",
        }}
      >
        Retour à l'accueil
      </button>
    </div>
  );
}

export default NotFound;