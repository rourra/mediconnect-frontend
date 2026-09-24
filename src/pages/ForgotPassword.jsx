import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsLoading(true);

    try {
      const res = await axios.post(`${API_URL}/api/auth/forgot-password`, {
        email,
      });
      setMessage(res.data.message);
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
        <h2>Mot de passe oublié</h2>
        <p style={{ color: "#666" }}>
          Entrez votre email, nous vous enverrons un lien pour réinitialiser
          votre mot de passe.
        </p>

        {message && (
          <div style={{ color: "green", fontSize: "0.9rem" }}>{message}</div>
        )}
        {error && (
          <div style={{ color: "red", fontSize: "0.9rem" }}>{error}</div>
        )}

        <input
          type="email"
          placeholder="Votre adresse email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
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
          {isLoading ? "Envoi..." : "Envoyer le lien"}
        </button>

        <Link to="/login" style={{ textAlign: "center", color: "#2563eb" }}>
          Retour à la connexion
        </Link>
      </form>
    </div>
  );
}

export default ForgotPassword;