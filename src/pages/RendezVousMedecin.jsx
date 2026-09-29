import { useEffect, useState } from "react";
import api from "../services/api";
import "./RendezVousMedecin.css";
const FILTRES = [
  { valeur: "tous", label: "Tous" },
  { valeur: "en_attente", label: "En attente" },
  { valeur: "confirme", label: "Confirmés" },
  { valeur: "termine", label: "Terminés" },
  { valeur: "annule", label: "Annulés" },
];

function RendezVousMedecin() {
  const [rdvs, setRdvs] = useState([]);
  const [filtre, setFiltre] = useState("tous");
  const [isLoading, setIsLoading] = useState(true);
  const [actionEnCours, setActionEnCours] = useState(null);

  const fetchRdvs = async () => {
    try {
      const res = await api.get("/appointments/medecin");
      setRdvs(res.data);
    } catch (error) {
      console.error("Erreur chargement rendez-vous :", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRdvs();
  }, []);

  const changerStatut = async (id, statut) => {
    setActionEnCours(id);
    try {
      await api.put(`/appointments/status/${id}`, { statut });
      await fetchRdvs();
    } catch (error) {
      alert(
        error.response?.data?.message || "Erreur lors de la mise à jour"
      );
    } finally {
      setActionEnCours(null);
    }
  };

  const annuler = (id) => {
    if (window.confirm("Confirmer l'annulation de ce rendez-vous ?")) {
      changerStatut(id, "annule");
    }
  };

  const heureAtteinte = (rdv) => {
    const dateHeureRdv = new Date(`${rdv.date}T${rdv.heure}`);
    return new Date() >= dateHeureRdv;
  };

  const rdvsFiltres =
    filtre === "tous" ? rdvs : rdvs.filter((r) => r.statut === filtre);

  return (
    <div className="rdvmed-page">
      <header className="rdvmed-header">
        <h1>📅 Mes rendez-vous</h1>
        <p>Gérez les demandes et le suivi de vos consultations.</p>
      </header>

      <div className="rdvmed-tabs">
        {FILTRES.map((f) => (
          <button
            key={f.valeur}
            className={filtre === f.valeur ? "active" : ""}
            onClick={() => setFiltre(f.valeur)}
          >
            {f.label}
            {f.valeur !== "tous" && (
              <span>{rdvs.filter((r) => r.statut === f.valeur).length}</span>
            )}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="rdvmed-loading">Chargement...</div>
      ) : rdvsFiltres.length === 0 ? (
        <div className="rdvmed-empty">Aucun rendez-vous dans cette catégorie.</div>
      ) : (
        <div className="rdvmed-list">
          {rdvsFiltres.map((r) => (
            <div className="rdvmed-item" key={r._id}>
              <img
                src={r.patient?.photo || "https://i.pravatar.cc/80?img=32"}
                alt={r.patient?.nom}
              />

              <div className="rdvmed-info">
                <strong>{r.patient?.nom || "Patient"}</strong>
                <p className="rdvmed-email">{r.patient?.email}</p>
                <p className="rdvmed-datetime">
                  📅 {r.date} — 🕒 {r.heure}
                </p>
                <p className="rdvmed-motif">{r.motif}</p>
              </div>

              <span className={`rdvmed-status ${r.statut}`}>
                {r.statut.replace("_", " ")}
              </span>

              <div className="rdvmed-actions">
                {r.statut === "en_attente" && (
                  <>
                    <button
                      className="btn-confirmer"
                      disabled={actionEnCours === r._id}
                      onClick={() => changerStatut(r._id, "confirme")}
                    >
                      ✅ Confirmer
                    </button>
                    <button
                      className="btn-annuler"
                      disabled={actionEnCours === r._id}
                      onClick={() => annuler(r._id)}
                    >
                      ❌ Refuser
                    </button>
                  </>
                )}

                {r.statut === "confirme" && (
                  <>
                    {heureAtteinte(r) ? (
                      <button
                        className="btn-terminer"
                        disabled={actionEnCours === r._id}
                        onClick={() => changerStatut(r._id, "termine")}
                      >
                        ✔️ Marquer terminé
                      </button>
                    ) : (
                      <span className="rdvmed-a-venir" title="Disponible à partir de la date et l'heure du rendez-vous">
                        🕒 RDV à venir
                      </span>
                    )}
                    <button
                      className="btn-annuler"
                      disabled={actionEnCours === r._id}
                      onClick={() => annuler(r._id)}
                    >
                      ❌ Annuler
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default RendezVousMedecin;