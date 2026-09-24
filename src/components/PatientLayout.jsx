import { Outlet, useLocation, useNavigate } from "react-router-dom";
import "./PatientLayout.css";

function PatientLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  // Détermine automatiquement le lien actif au lieu de le coder en dur
  const estActif = (chemin) => location.pathname === chemin;

  const deconnexion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="patient-page">
      <aside className="patient-sidebar">
        <div className="brand">💙 MediConnect</div>

        <nav>
          <a
            className={estActif("/patient") ? "active" : ""}
            onClick={() => navigate("/patient")}
          >
            🏠 Tableau de bord
          </a>

          <a
            className={estActif("/patient/rdv") ? "active" : ""}
            onClick={() => navigate("/patient/rdv")}
          >
            📅 Mes rendez-vous
          </a>

          <a
            className={estActif("/patient/messages") ? "active" : ""}
            onClick={() => navigate("/patient/messages")}
          >
            💬 Messagerie
          </a>

          <a
            className={estActif("/patient/dossier") ? "active" : ""}
            onClick={() => navigate("/patient/dossier")}
          >
            📁 Dossier médical
          </a>

          <a
            className={estActif("/patient/medecins") ? "active" : ""}
            onClick={() => navigate("/patient/medecins")}
          >
            👨‍⚕️ Trouver un médecin
          </a>

          <a
            className={estActif("/patient/avis") ? "active" : ""}
            onClick={() => navigate("/patient/avis")}
          >
            ⭐ Mes avis
          </a>

          <a
            className={estActif("/patient/settings") ? "active" : ""}
            onClick={() => navigate("/patient/settings")}
          >
            ⚙️ Paramètres
          </a>
        </nav>

        <div className="help-card">
          <h4>Besoin d'aide ?</h4>
          <p>Notre assistant médical est là pour vous aider.</p>
          <button onClick={() => navigate("/patient/assistant")}>Discuter avec l'assistant</button>
        </div>

        <button className="logout-btn" onClick={deconnexion}>
          🚪 Déconnexion
        </button>
      </aside>

      <main className="patient-main">
        <Outlet />
      </main>
    </div>
  );
}

export default PatientLayout;