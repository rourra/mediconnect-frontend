import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./AvisPatient.css";

function AvisPatient() {
  const navigate = useNavigate();

  const [medecinsEligibles, setMedecinsEligibles] = useState([]);
  const [avis, setAvis] = useState([]);
  const [medecinId, setMedecinId] = useState("");
  const [note, setNote] = useState(5);
  const [commentaire, setCommentaire] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [erreur, setErreur] = useState("");
  const [message, setMessage] = useState("");

  const fetchData = async () => {
    try {
      const [resRdvs, resAvis] = await Promise.all([
        api.get("/appointments/patient"),
        api.get("/reviews/me"),
      ]);

      const medecinsDejaNotes = new Set(resAvis.data.map((a) => a.medecin?._id));

      // Un médecin est "évaluable" seulement s'il y a eu une consultation
      // terminée avec lui, et qu'il n'a pas déjà été noté (cohérent avec
      // la règle backend : 1 avis max par médecin, après un RDV terminé).
      const medecinsUniques = new Map();
      resRdvs.data
        .filter((r) => r.statut === "termine" && r.medecin)
        .forEach((r) => {
          if (!medecinsDejaNotes.has(r.medecin._id)) {
            medecinsUniques.set(r.medecin._id, r.medecin);
          }
        });

      setMedecinsEligibles(Array.from(medecinsUniques.values()));
      setAvis(resAvis.data);
    } catch (error) {
      console.error("Erreur chargement avis :", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const envoyerAvis = async (e) => {
    e.preventDefault();
    setErreur("");
    setMessage("");

    if (!medecinId || !commentaire.trim()) {
      setErreur("Veuillez choisir un médecin et écrire un commentaire.");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post("/reviews", { medecinId, note, commentaire: commentaire.trim() });

      setMessage("Avis envoyé avec succès.");
      setMedecinId("");
      setNote(5);
      setCommentaire("");

      await fetchData();
    } catch (error) {
      setErreur(error.response?.data?.message || "Erreur lors de l'envoi de l'avis");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedMedecin = medecinsEligibles.find((m) => m._id === medecinId);

  return (
    <div className="avispat-page">
      <button className="avispat-back" onClick={() => navigate("/patient")}>
        ← Retour
      </button>

      <header className="avispat-header">
        <h1>⭐ Avis & Évaluations</h1>
        <p>Évaluez vos médecins et partagez votre expérience médicale.</p>
      </header>

      {isLoading ? (
        <div className="avispat-loading">Chargement...</div>
      ) : (
        <div className="avispat-layout">
          <div className="avispat-card">
            <h2>Donner un avis</h2>

            {medecinsEligibles.length === 0 ? (
              <p className="avispat-empty">
                Vous pourrez laisser un avis après une consultation terminée
                avec un médecin. Aucun médecin n'est éligible pour le moment.
              </p>
            ) : (
              <form onSubmit={envoyerAvis}>
                {message && <div className="avispat-success">{message}</div>}
                {erreur && <div className="avispat-error">{erreur}</div>}

                <label>Médecin</label>
                <select
                  value={medecinId}
                  onChange={(e) => setMedecinId(e.target.value)}
                  required
                >
                  <option value="">Choisir un médecin</option>
                  {medecinsEligibles.map((m) => (
                    <option key={m._id} value={m._id}>
                      Dr. {m.nom} — {m.specialite || "Généraliste"}
                    </option>
                  ))}
                </select>

                {selectedMedecin && (
                  <div className="avispat-selected-doctor">
                    <img
                      src={selectedMedecin.photo || "https://i.pravatar.cc/100?img=12"}
                      alt={selectedMedecin.nom}
                    />
                    <div>
                      <h3>Dr. {selectedMedecin.nom}</h3>
                      <p>{selectedMedecin.specialite || "Médecin généraliste"}</p>
                    </div>
                  </div>
                )}

                <label>Note</label>
                <div className="avispat-stars">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={star <= note ? "active" : ""}
                      onClick={() => setNote(star)}
                    >
                      ★
                    </span>
                  ))}
                  <span className="avispat-note-value">{note}/5</span>
                </div>

                <label>Commentaire</label>
                <textarea
                  placeholder="Écrivez votre avis..."
                  value={commentaire}
                  onChange={(e) => setCommentaire(e.target.value)}
                  required
                />

                <button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Envoi..." : "Envoyer l'avis"}
                </button>
              </form>
            )}
          </div>

          <div className="avispat-card">
            <h2>Mes avis récents</h2>

            {avis.length === 0 ? (
              <p className="avispat-empty">Aucun avis envoyé pour le moment.</p>
            ) : (
              avis.map((a) => (
                <div className="avispat-item" key={a._id}>
                  <div className="avispat-item-doctor">
                    <img
                      src={a.medecin?.photo || "https://i.pravatar.cc/80?img=15"}
                      alt={a.medecin?.nom}
                    />
                    <div>
                      <h3>Dr. {a.medecin?.nom}</h3>
                      <p>{a.medecin?.specialite || "Médecin généraliste"}</p>
                    </div>
                  </div>

                  <div className="avispat-item-note">
                    {"★".repeat(a.note)}
                    {"☆".repeat(5 - a.note)}
                  </div>

                  <p>{a.commentaire}</p>
                  <small>{new Date(a.createdAt).toLocaleDateString("fr-FR")}</small>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AvisPatient;