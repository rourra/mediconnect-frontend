import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import logo from "../assets/mediconnect-logo.png";
import doctorImg from "../assets/doctor.avif";
import "./Login.css";

// Utilise une variable d'environnement en production (voir note à la fin)
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const LABELS_ROLE = {
  patient: "patient",
  medecin: "médecin",
  admin: "administrateur",
};

function Login() {
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [role, setRole] = useState("patient");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        motDePasse,
      });

      const utilisateur = res.data.user;

      // Le rôle sélectionné sur les boutons doit correspondre au vrai rôle du
      // compte. Ça évite qu'un médecin ou un admin se retrouve par erreur sur
      // le mauvais tableau de bord en ayant cliqué le mauvais bouton.
      if (utilisateur.role !== role) {
        setError(
          `Ce compte n'est pas un compte ${LABELS_ROLE[role]}. Sélectionnez "${LABELS_ROLE[utilisateur.role]}" pour vous connecter.`
        );
        setIsLoading(false);
        return;
      }

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", utilisateur.role);
      localStorage.setItem("user", JSON.stringify(utilisateur));

      if (utilisateur.role === "patient") navigate("/patient");
      else if (utilisateur.role === "medecin") navigate("/medecin");
      else if (utilisateur.role === "admin") navigate("/admin");
    } catch (err) {
      // Affiche le vrai message du backend (ex: "compte en attente de
      // validation") au lieu d'un message générique qui cache l'information.
      setError(
        err.response?.data?.message || "Email ou mot de passe incorrect"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-modern-page">
      <div className="login-language">🌐 Français ˅</div>

      <section className="login-left-panel">
        <div className="login-brand">
          <img src={logo} alt="MediConnect" />
          <p>La plateforme qui connecte médecins et patients</p>
        </div>

        <h1>
          Votre <span>santé</span>,<br />
          notre priorité
        </h1>

        <div className="line"></div>

        <p className="login-description">
          Prenez rendez-vous, consultez vos dossiers médicaux et échangez
          facilement avec vos médecins.
        </p>

        <div className="login-feature">
          <div className="feature-icon blue">📅</div>
          <div>
            <h3>Rendez-vous en ligne</h3>
            <p>Trouvez et réservez votre rendez-vous facilement.</p>
          </div>
        </div>

        <div className="login-feature">
          <div className="feature-icon green">📁</div>
          <div>
            <h3>Dossier médical sécurisé</h3>
            <p>Accédez à vos documents médicaux en toute sécurité.</p>
          </div>
        </div>

        <div className="login-feature">
          <div className="feature-icon blue">💬</div>
          <div>
            <h3>Messagerie sécurisée</h3>
            <p>Communiquez en toute confidentialité avec votre médecin.</p>
          </div>
        </div>

        <img className="doctor-login-img" src={doctorImg} alt="Médecin" />

        <div className="security-box">
          🛡️
          <p>Vos données sont protégées avec le plus haut niveau de sécurité.</p>
        </div>
      </section>

      <section className="login-right-panel">
        <form className="login-modern-card" onSubmit={handleLogin}>
          <h2>Se connecter</h2>
          <p>Bienvenue ! Connectez-vous à votre compte</p>

          {error && <div className="login-error">{error}</div>}

          <label>Adresse e-mail</label>
          <div className="input-group">
            <span>👤</span>
            <input
              type="email"
              placeholder="Entrez votre e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <label>Mot de passe</label>
          <div className="input-group">
            <span>🔒</span>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Entrez votre mot de passe"
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              required
            />
            <button
              type="button"
              className="eye-btn"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>

          <a className="forgot" onClick={() => navigate("/forgot-password")}>
            Mot de passe oublié ?
          </a>

          <button className="login-submit" type="submit" disabled={isLoading}>
            {isLoading ? "Connexion..." : "Se connecter"}
          </button>

          <div className="separator">
            <span></span>
            <p>ou</p>
            <span></span>
          </div>

          <div className="role-boxes">
            <button
              type="button"
              className={role === "patient" ? "selected" : ""}
              onClick={() => setRole("patient")}
            >
              👤 <br /> Je suis patient
            </button>

            <button
              type="button"
              className={role === "medecin" ? "selected green-border" : ""}
              onClick={() => setRole("medecin")}
            >
              🧑‍⚕️ <br /> Je suis médecin
            </button>

            <button
              type="button"
              className={role === "admin" ? "selected" : ""}
              onClick={() => setRole("admin")}
            >
              🛡️ <br /> Administrateur
            </button>
          </div>

          <p className="create-account">
            Vous n’avez pas de compte ?{" "}
            <span onClick={() => navigate("/register")}>Créer un compte</span>
          </p>
        </form>
      </section>
    </div>
  );
}

export default Login;