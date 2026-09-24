import { useEffect, useState } from "react";
import api from "../services/api";
import "./InvitationsMedecin.css";

const FILTRES = [
  { valeur: "tous", label: "Toutes" },
  { valeur: "en_attente", label: "En attente" },
  { valeur: "acceptee", label: "Acceptées" },
  { valeur: "refusee", label: "Refusées" },
];

function InvitationsMedecin() {
  const [invitations, setInvitations] = useState([]);
  const [filtre, setFiltre] = useState("tous");
  const [isLoading, setIsLoading] = useState(true);
  const [actionEnCours, setActionEnCours] = useState(null);

  const chargerInvitations = async () => {
    try {
      const res = await api.get("/invitations/medecin");
      setInvitations(res.data);
    } catch (error) {
      console.error("Erreur chargement invitations :", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    chargerInvitations();
  }, []);

  const repondre = async (id, statut) => {
    setActionEnCours(id);
    try {
      await api.put(`/invitations/${id}`, { statut });
      await chargerInvitations();
    } catch (error) {
      alert(error.response?.data?.message || "Erreur réponse invitation");
    } finally {
      setActionEnCours(null);
    }
  };

  const invitationsFiltrees =
    filtre === "tous"
      ? invitations
      : invitations.filter((inv) => inv.statut === filtre);

  return (
    <div className="invmed-page">
      <header className="invmed-header">
        <h1>📩 Invitations des patients</h1>
        <p>Acceptez ou refusez les demandes de suivi envoyées par les patients.</p>
      </header>

      <div className="invmed-tabs">
        {FILTRES.map((f) => (
          <button
            key={f.valeur}
            className={filtre === f.valeur ? "active" : ""}
            onClick={() => setFiltre(f.valeur)}
          >
            {f.label}
            {f.valeur !== "tous" && (
              <span>
                {invitations.filter((inv) => inv.statut === f.valeur).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="invmed-loading">Chargement...</div>
      ) : invitationsFiltrees.length === 0 ? (
        <div className="invmed-empty">
          <h3>Aucune invitation</h3>
          <p>Rien à afficher dans cette catégorie pour le moment.</p>
        </div>
      ) : (
        <div className="invmed-grid">
          {invitationsFiltrees.map((inv) => (
            <div className="invmed-card" key={inv._id}>
              <img
                src={inv.patient?.photo || "https://i.pravatar.cc/100?img=47"}
                alt={inv.patient?.nom}
              />

              <h2>{inv.patient?.nom}</h2>
              <p className="invmed-email">{inv.patient?.email}</p>

              <span className={`invmed-status ${inv.statut}`}>
                {inv.statut.replace("_", " ")}
              </span>

              {inv.statut === "en_attente" && (
                <div className="invmed-actions">
                  <button
                    className="btn-accepter"
                    disabled={actionEnCours === inv._id}
                    onClick={() => repondre(inv._id, "acceptee")}
                  >
                    {actionEnCours === inv._id ? "..." : "✅ Accepter"}
                  </button>

                  <button
                    className="btn-refuser"
                    disabled={actionEnCours === inv._id}
                    onClick={() => repondre(inv._id, "refusee")}
                  >
                    {actionEnCours === inv._id ? "..." : "❌ Refuser"}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default InvitationsMedecin;