import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import api from "../services/api";
import "./RendezVousPatient.css";

const FILTRES = [
  { valeur: "tous", label: "Tous" },
  { valeur: "en_attente", label: "En attente" },
  { valeur: "confirme", label: "Confirmés" },
  { valeur: "termine", label: "Terminés" },
  { valeur: "annule", label: "Annulés" },
];

function RendezVousPatient() {
  const [medecins, setMedecins] = useState([]);
  const [rdvs, setRdvs] = useState([]);
  const [filtre, setFiltre] = useState("tous");
  const [medecinId, setMedecinId] = useState("");
  const [motif, setMotif] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [heure, setHeure] = useState("");
  const [creneaux, setCreneaux] = useState([]);
  const [isLoadingCreneaux, setIsLoadingCreneaux] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [erreurForm, setErreurForm] = useState("");

  const formatDate = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const fetchData = async () => {
    try {
      const [resMed, resRdv] = await Promise.all([
        api.get("/users/medecins"),
        api.get("/appointments/patient"),
      ]);
      setMedecins(resMed.data);
      setRdvs(resRdv.data);
    } catch (error) {
      console.error("Erreur chargement :", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Recharge les créneaux réellement libres dès que médecin + date sont choisis
  useEffect(() => {
    setHeure("");
    setCreneaux([]);

    if (!medecinId || !selectedDate) return;

    const chargerCreneaux = async () => {
      setIsLoadingCreneaux(true);
      try {
        const res = await api.get("/disponibilites/creneaux", {
          params: { medecinId, date: formatDate(selectedDate) },
        });
        setCreneaux(res.data.creneaux);
      } catch (error) {
        console.error("Erreur chargement créneaux :", error);
      } finally {
        setIsLoadingCreneaux(false);
      }
    };

    chargerCreneaux();
  }, [medecinId, selectedDate]);

  const creerRdv = async (e) => {
    e.preventDefault();
    setErreurForm("");

    if (!medecinId || !selectedDate || !heure || !motif.trim()) {
      setErreurForm("Veuillez remplir tous les champs.");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post("/appointments/create", {
        medecinId,
        date: formatDate(selectedDate),
        heure,
        motif,
      });

      setMedecinId("");
      setSelectedDate(null);
      setHeure("");
      setMotif("");

      await fetchData();
    } catch (error) {
      setErreurForm(
        error.response?.data?.message || "Erreur lors de la demande de RDV"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const annulerRdv = async (id) => {
    if (!window.confirm("Voulez-vous vraiment annuler ce rendez-vous ?")) return;

    try {
      await api.put(`/appointments/status/${id}`, { statut: "annule" });
      await fetchData();
    } catch (error) {
      alert(error.response?.data?.message || "Erreur lors de l'annulation");
    }
  };

  const rdvsFiltres =
    filtre === "tous" ? rdvs : rdvs.filter((r) => r.statut === filtre);

  return (
    <div className="rdvpat-page">
      {/* ================= FORMULAIRE ================= */}
      <div className="rdvpat-card">
        <h1>📅 Demander un rendez-vous</h1>

        <form onSubmit={creerRdv}>
          {erreurForm && <div className="rdvpat-error">{erreurForm}</div>}

          <label>Médecin</label>
          <select value={medecinId} onChange={(e) => setMedecinId(e.target.value)} required>
            <option value="">Choisir un médecin</option>
            {medecins.length === 0 ? (
              <option disabled>Aucun médecin disponible</option>
            ) : (
              medecins.map((m) => (
                <option key={m._id} value={m._id}>
                  Dr. {m.nom} — {m.specialite || "Généraliste"}
                </option>
              ))
            )}
          </select>

          <div className="rdvpat-field">
            <label>Date du rendez-vous</label>
            <DatePicker
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              dateFormat="dd/MM/yyyy"
              minDate={new Date()}
              placeholderText="Choisir une date"
              className="rdvpat-input"
            />
          </div>

          <div className="rdvpat-field">
            <label>Heure du rendez-vous</label>

            {!medecinId || !selectedDate ? (
              <p className="rdvpat-hint">Choisissez d'abord un médecin et une date.</p>
            ) : isLoadingCreneaux ? (
              <p className="rdvpat-hint">Chargement des créneaux...</p>
            ) : creneaux.length === 0 ? (
              <p className="rdvpat-hint">Aucun créneau libre ce jour-là. Essayez une autre date.</p>
            ) : (
              <div className="rdvpat-creneaux">
                {creneaux.map((c) => (
                  <button
                    type="button"
                    key={c}
                    className={heure === c ? "active" : ""}
                    onClick={() => setHeure(c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>

          <p className="rdvpat-info">
            Seuls les créneaux réellement disponibles du médecin choisi sont proposés.
          </p>

          <label>Motif</label>
          <input
            type="text"
            placeholder="Ex: Consultation de suivi"
            value={motif}
            onChange={(e) => setMotif(e.target.value)}
            required
          />

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Envoi..." : "Envoyer la demande"}
          </button>
        </form>
      </div>

      {/* ================= LISTE DES RDV ================= */}
      <div className="rdvpat-card rdvpat-list-section">
        <div className="rdvpat-section-header">
          <div>
            <h2>Mes rendez-vous</h2>
            <p>Consultez et gérez vos demandes de rendez-vous.</p>
          </div>
          <span className="rdvpat-count">{rdvs.length} RDV</span>
        </div>

        <div className="rdvpat-tabs">
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
          <div className="rdvpat-loading">Chargement...</div>
        ) : rdvsFiltres.length === 0 ? (
          <div className="rdvpat-empty">
            <div className="empty-icon">📅</div>
            <h3>Aucun rendez-vous</h3>
            <p>Rien à afficher dans cette catégorie.</p>
          </div>
        ) : (
          <div className="rdvpat-grid">
            {rdvsFiltres.map((r) => (
              <div className="rdvpat-item-card" key={r._id}>
                <div className="rdvpat-top">
                  <img
                    src={r.medecin?.photo || "https://i.pravatar.cc/80?img=15"}
                    alt="médecin"
                  />
                  <div>
                    <h3>Dr. {r.medecin?.nom || "Médecin"}</h3>
                    <p>{r.medecin?.specialite || "Médecin généraliste"}</p>
                  </div>
                </div>

                <div className="rdvpat-info-grid">
                  <div>
                    <span>📅 Date</span>
                    <strong>{r.date}</strong>
                  </div>
                  <div>
                    <span>⏰ Heure</span>
                    <strong>{r.heure}</strong>
                  </div>
                  <div>
                    <span>📝 Motif</span>
                    <strong>{r.motif}</strong>
                  </div>
                </div>

                <div className="rdvpat-footer">
                  <span className={`rdvpat-badge ${r.statut}`}>
                    {r.statut.replace("_", " ")}
                  </span>

                  {(r.statut === "en_attente" || r.statut === "confirme") && (
                    <button
                      className="rdvpat-delete-btn"
                      onClick={() => annulerRdv(r._id)}
                    >
                      🗑 Annuler
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default RendezVousPatient;