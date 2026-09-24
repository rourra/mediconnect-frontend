import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./DashboardPatient.css";

function DashboardPatient() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user")) || {};

  const [rdvs, setRdvs] = useState([]);
  const [medecins, setMedecins] = useState([]);
  const [messagesNonLus, setMessagesNonLus] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const chargerDonnees = async () => {
      try {
        const [resRdvs, resMedecins, resNonLus] = await Promise.all([
          api.get("/appointments/patient"),
          api.get("/users/medecins"),
          api.get("/messages/non-lus"),
        ]);
        setRdvs(resRdvs.data);
        setMedecins(resMedecins.data);
        setMessagesNonLus(resNonLus.data.total);
      } catch (error) {
        console.error("Erreur chargement dashboard :", error);
      } finally {
        setIsLoading(false);
      }
    };

    chargerDonnees();
  }, []);

  return (
    <>
      <header className="patient-topbar">
        <div>
          <h1>Bonjour, {user.nom || "Patient"} 👋</h1>
          <p>Prenez soin de votre santé, nous sommes là pour vous.</p>
        </div>

        <div className="patient-profile-box">
          <div
            className="profile-icons"
            onClick={() => navigate("/patient/messages")}
          >
            <span className="profile-icon-msg">
              💬
              {messagesNonLus > 0 && (
                <span className="profile-icon-badge">{messagesNonLus}</span>
              )}
            </span>
          </div>

          <img
            src={user.photo || "https://i.pravatar.cc/150?img=47"}
            alt="profil"
          />

          <div>
            <strong>{user.nom || "Patient"}</strong>
            <p
              onClick={() => navigate("/patient/settings")}
              className="profile-link"
            >
              Voir mon profil
            </p>
          </div>
        </div>
      </header>

      {isLoading ? (
        <div className="dashboard-loading">Chargement...</div>
      ) : (
        <section className="patient-grid">
          <div className="patient-card big-card">
            <h3>📅 Mes prochains rendez-vous</h3>

            {rdvs.length === 0 ? (
              <p className="empty-state">Aucun rendez-vous pour le moment.</p>
            ) : (
              rdvs.slice(0, 3).map((r) => (
                <div className="rdv-dashboard-item" key={r._id}>
                  <div className="rdv-date-box">
                    <strong>{r.date}</strong>
                    <span>{r.heure}</span>
                  </div>

                  <div className="rdv-info-box">
                    <h4>Dr. {r.medecin?.nom || "Médecin"}</h4>
                    <p>{r.medecin?.specialite || "Médecin généraliste"}</p>
                    <p>{r.motif || "Consultation médicale"}</p>
                  </div>

                  <span className={`rdv-status ${r.statut}`}>{r.statut}</span>
                </div>
              ))
            )}

            <button onClick={() => navigate("/patient/rdv")}>
              Voir tous les rendez-vous
            </button>
          </div>

          {/* ⚠️ Section factice en attendant le backend de messagerie */}
          <div className="patient-card">
            <h3>💬 Messages récents</h3>
            <p className="empty-state">
              La messagerie sera bientôt disponible.
            </p>
            <button
              className="full-btn"
              onClick={() => navigate("/patient/messages")}
            >
              Ouvrir la messagerie
            </button>
          </div>

          <div className="patient-card">
            <h3>Résumé de ma santé</h3>

            <div className="mini-stats">
              <div>
                <span className="stat-icon">📅</span>
                <strong>{rdvs.length}</strong>
                <span>Rendez-vous</span>
              </div>

              <div>
                <span className="stat-icon">👨‍⚕️</span>
                <strong>{medecins.length}</strong>
                <span>Médecins</span>
              </div>
            </div>
          </div>

          <div className="patient-card">
            <h3>Accès rapide</h3>

            <div className="quick-grid">
              <button onClick={() => navigate("/patient/dossier")}>
                📄 Ajouter document
              </button>

              <button onClick={() => navigate("/patient/rdv")}>
                📅 Nouveau RDV
              </button>

              <button onClick={() => navigate("/patient/messages")}>
                ❓ Poser question
              </button>

              <button onClick={() => navigate("/patient/medecins")}>
                👨‍⚕️ Trouver un médecin
              </button>
            </div>
          </div>

          <div className="patient-card doctors-mini-card">
            <div className="card-title-row">
              <h3>👨‍⚕️ Mes médecins</h3>
              <button onClick={() => navigate("/patient/medecins")}>
                Voir tous
              </button>
            </div>

            {medecins.length === 0 ? (
              <p className="empty-state">Aucun médecin inscrit pour le moment.</p>
            ) : (
              medecins.slice(0, 3).map((m) => (
                <div className="doctor-mini-item" key={m._id}>
                  <img
                    src={m.photo || "https://i.pravatar.cc/80?img=12"}
                    alt="médecin"
                  />
                  <div>
                    <strong>Dr. {m.nom}</strong>
                    <p>{m.specialite || "Médecin généraliste"}</p>
                    <p>{m.email}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      )}
    </>
  );
}

export default DashboardPatient;