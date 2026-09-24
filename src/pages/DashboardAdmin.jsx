import { useEffect, useState } from "react";
import api from "../services/api";
import StatistiquesAdmin from "../components/StatistiquesAdmin";
import "./DashboardAdmin.css";

function DashboardAdmin() {
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionEnCours, setActionEnCours] = useState(null);
  const [message, setMessage] = useState("");

  const chargerUtilisateurs = async () => {
    try {
      const res = await api.get("/users/admin/utilisateurs");
      setUtilisateurs(res.data);
    } catch (error) {
      console.error("Erreur chargement utilisateurs :", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    chargerUtilisateurs();
  }, []);

  const medecinsEnAttente = utilisateurs.filter(
    (u) => u.role === "medecin" && u.statutValidation === "en_attente"
  );
  const totalPatients = utilisateurs.filter((u) => u.role === "patient").length;
  const totalMedecinsValides = utilisateurs.filter(
    (u) => u.role === "medecin" && u.statutValidation === "valide"
  ).length;

  const handleValider = async (id) => {
    setActionEnCours(id);
    setMessage("");
    try {
      await api.put(`/users/admin/valider/${id}`);
      setUtilisateurs((prev) =>
        prev.map((u) =>
          u._id === id ? { ...u, statutValidation: "valide" } : u
        )
      );
      setMessage("Médecin validé avec succès.");
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Erreur lors de la validation"
      );
    } finally {
      setActionEnCours(null);
    }
  };

  const handleRefuser = async (id) => {
    setActionEnCours(id);
    setMessage("");
    try {
      await api.put(`/users/admin/refuser/${id}`);
      setUtilisateurs((prev) =>
        prev.map((u) =>
          u._id === id ? { ...u, statutValidation: "refuse" } : u
        )
      );
      setMessage("Médecin refusé.");
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Erreur lors du refus"
      );
    } finally {
      setActionEnCours(null);
    }
  };

  return (
    <>
      <header className="admin-topbar">
        <div>
          <h1>Tableau de bord administrateur 🛡️</h1>
          <p>Gérez les comptes et validez les médecins de la plateforme.</p>
        </div>
      </header>

      {isLoading ? (
        <div className="dashboard-loading">Chargement...</div>
      ) : (
        <>
          <section className="admin-stats">
            <div className="admin-stat-card">
              <span className="stat-icon">👥</span>
              <div>
                <strong>{totalPatients}</strong>
                <p>Patients inscrits</p>
              </div>
            </div>

            <div className="admin-stat-card">
              <span className="stat-icon">✅</span>
              <div>
                <strong>{totalMedecinsValides}</strong>
                <p>Médecins validés</p>
              </div>
            </div>

            <div className="admin-stat-card highlight">
              <span className="stat-icon">⏳</span>
              <div>
                <strong>{medecinsEnAttente.length}</strong>
                <p>En attente de validation</p>
              </div>
            </div>
          </section>

          {message && <div className="admin-message">{message}</div>}

          <section className="admin-card">
            <h3>⏳ Médecins en attente de validation</h3>

            {medecinsEnAttente.length === 0 ? (
              <p className="empty-state">
                Aucun médecin en attente pour le moment.
              </p>
            ) : (
              <div className="pending-table">
                {medecinsEnAttente.map((m) => (
                  <div className="pending-row" key={m._id}>
                    <img
                      src={m.photo || "https://i.pravatar.cc/80?img=15"}
                      alt={m.nom}
                    />

                    <div className="pending-info">
                      <strong>Dr. {m.nom}</strong>
                      <p>{m.email}</p>
                      <p>{m.specialite || "Spécialité non renseignée"}</p>
                      {m.numeroOrdre && <p>N° d'ordre : {m.numeroOrdre}</p>}
                      {m.justificatifUrl && (
                        <a
                          href={m.justificatifUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="pending-justificatif-link"
                        >
                          📄 Voir le justificatif
                        </a>
                      )}
                    </div>

                    <div className="pending-actions">
                      <button
                        className="btn-valider"
                        disabled={actionEnCours === m._id}
                        onClick={() => handleValider(m._id)}
                      >
                        {actionEnCours === m._id ? "..." : "✅ Valider"}
                      </button>
                      <button
                        className="btn-refuser"
                        disabled={actionEnCours === m._id}
                        onClick={() => handleRefuser(m._id)}
                      >
                        {actionEnCours === m._id ? "..." : "❌ Refuser"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <StatistiquesAdmin utilisateurs={utilisateurs} />
        </>
      )}
    </>
  );
}

export default DashboardAdmin;