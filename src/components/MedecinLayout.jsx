import { Outlet, useLocation, useNavigate } from "react-router-dom";
import "./MedecinLayout.css";

function MedecinLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user")) || {};

  const estActif = (chemin) => location.pathname === chemin;

  const deconnexion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="medecin-page">
      <aside className="medecin-sidebar">
        <div className="brand">💙 MediConnect</div>

        <nav>
          <a
            className={estActif("/medecin") ? "active" : ""}
            onClick={() => navigate("/medecin")}
          >
            🏠 Tableau de bord
          </a>

          <a
            className={estActif("/medecin/rdv") ? "active" : ""}
            onClick={() => navigate("/medecin/rdv")}
          >
            📅 Mes rendez-vous
          </a>

          <a
            className={estActif("/medecin/messages") ? "active" : ""}
            onClick={() => navigate("/medecin/messages")}
          >
            💬 Messagerie
          </a>

          <a
            className={location.pathname.startsWith("/medecin/patients") ? "active" : ""}
            onClick={() => navigate("/medecin/patients")}
          >
            👥 Mes patients
          </a>

          <a
            className={estActif("/medecin/disponibilites") ? "active" : ""}
            onClick={() => navigate("/medecin/disponibilites")}
          >
            🗓️ Disponibilités
          </a>

          <a
            className={estActif("/medecin/invitations") ? "active" : ""}
            onClick={() => navigate("/medecin/invitations")}
          >
            📨 Invitations patients
          </a>

          <a
            className={estActif("/medecin/parametres") ? "active" : ""}
            onClick={() => navigate("/medecin/parametres")}
          >
            ⚙️ Paramètres
          </a>
        </nav>

        <div className="medecin-status-card">
          <span className={`status-dot ${user.statutValidation}`}></span>
          <div>
            <strong>Statut du compte</strong>
            <p>
              {user.statutValidation === "valide"
                ? "Compte validé"
                : "En attente de validation"}
            </p>
          </div>
        </div>

        <button className="logout-btn" onClick={deconnexion}>
          🚪 Déconnexion
        </button>
      </aside>

      <main className="medecin-main">
        <Outlet />
      </main>
    </div>
  );
}

export default MedecinLayout;