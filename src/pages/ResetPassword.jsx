import { useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [nouveauMotDePasse, setNouveauMotDePasse] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (nouveauMotDePasse !== confirmation) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    setIsLoading(true);

    try {
      const res = await axios.put(
        `${API_URL}/api/auth/reset-password/${token}`,
        { nouveauMotDePasse }
      );
      setMessage(res.data.message);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(
        err.response?.data?.message || "Une erreur est survenue, réessayez"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          maxWidth: "400px",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <h2>Nouveau mot de passe</h2>

        {message && (
          <div style={{ color: "green", fontSize: "0.9rem" }}>{message}</div>
        )}
        {error && (
          <div style={{ color: "red", fontSize: "0.9rem" }}>{error}</div>
        )}

        <input
          type="password"
          placeholder="Nouveau mot de passe"
          value={nouveauMotDePasse}
          onChange={(e) => setNouveauMotDePasse(e.target.value)}
          required
          minLength={6}
          style={{ padding: "0.75rem", borderRadius: "8px", border: "1px solid #ccc" }}
        />

        <input
          type="password"
          placeholder="Confirmez le mot de passe"
          value={confirmation}
          onChange={(e) => setConfirmation(e.target.value)}
          required
          minLength={6}
          style={{ padding: "0.75rem", borderRadius: "8px", border: "1px solid #ccc" }}
        />

        <button
          type="submit"
          disabled={isLoading}
          style={{
            padding: "0.75rem",
            borderRadius: "8px",
            border: "none",
            background: "#2563eb",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          {isLoading ? "Enregistrement..." : "Réinitialiser le mot de passe"}
        </button>
      </form>
    </div>
  );
}

export default ResetPassword;