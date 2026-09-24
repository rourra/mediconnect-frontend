import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import "./DossierPatientMedecin.css";

const CATEGORIES = [
  "Cardiovasculaire",
  "Respiratoire",
  "Digestif",
  "Endocrinien / Métabolique",
  "Dermatologique",
  "Neurologique",
  "Psychiatrique",
  "Musculo-squelettique",
  "Infectieux",
  "ORL / Ophtalmologique",
  "Gynécologique / Urologique",
  "Autre",
];

function DossierPatientMedecin() {
  const { patientId } = useParams();
  const navigate = useNavigate();

  const [dossier, setDossier] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [erreurChargement, setErreurChargement] = useState("");

  const [categorie, setCategorie] = useState("Autre");
  const [description, setDescription] = useState("");
  const [isSavingDiag, setIsSavingDiag] = useState(false);
  const [messageDiag, setMessageDiag] = useState("");

  const [medicament, setMedicament] = useState("");
  const [dosage, setDosage] = useState("");
  const [duree, setDuree] = useState("");
  const [isSavingPresc, setIsSavingPresc] = useState(false);
  const [messagePresc, setMessagePresc] = useState("");

  const [annulationEnCours, setAnnulationEnCours] = useState(null);

  const userId = JSON.parse(localStorage.getItem("user"))?.id;

  const charger = async () => {
    try {
      const res = await api.get(`/dossiers/patient/${patientId}`);
      setDossier(res.data);
    } catch (error) {
      setErreurChargement(
        error.response?.data?.message || "Erreur lors du chargement du dossier"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    charger();
  }, [patientId]);

  const ajouterDiagnostic = async (e) => {
    e.preventDefault();
    setMessageDiag("");
    if (!description.trim()) return;

    setIsSavingDiag(true);
    try {
      await api.post(`/dossiers/diagnostic/${patientId}`, {
        categorie,
        description: description.trim(),
      });
      setMessageDiag("Diagnostic ajouté avec succès.");
      setDescription("");
      setCategorie("Autre");
      await charger();
    } catch (error) {
      setMessageDiag(
        error.response?.data?.message || "Erreur lors de l'ajout du diagnostic"
      );
    } finally {
      setIsSavingDiag(false);
    }
  };

  const ajouterPrescription = async (e) => {
    e.preventDefault();
    setMessagePresc("");
    if (!medicament.trim() || !dosage.trim() || !duree.trim()) return;

    setIsSavingPresc(true);
    try {
      await api.post(`/dossiers/prescription/${patientId}`, {
        medicament: medicament.trim(),
        dosage: dosage.trim(),
        duree: duree.trim(),
      });
      setMessagePresc("Prescription ajoutée avec succès.");
      setMedicament("");
      setDosage("");
      setDuree("");
      await charger();
    } catch (error) {
      setMessagePresc(
        error.response?.data?.message || "Erreur lors de l'ajout de la prescription"
      );
    } finally {
      setIsSavingPresc(false);
    }
  };

  const annulerEntree = async (type, id) => {
    if (!window.confirm("Confirmer l'annulation ? Une trace restera visible.")) return;

    setAnnulationEnCours(id);
    try {
      await api.put(`/dossiers/${type}/${patientId}/${id}/annuler`);
      await charger();
    } catch (error) {
      alert(error.response?.data?.message || "Erreur lors de l'annulation");
    } finally {
      setAnnulationEnCours(null);
    }
  };

  if (isLoading) {
    return <div className="dpm-page dpm-loading">Chargement...</div>;
  }

  if (erreurChargement) {
    return (
      <div className="dpm-page">
        <button className="dpm-back" onClick={() => navigate("/medecin/patients")}>
          ← Retour
        </button>
        <div className="dpm-error-box">{erreurChargement}</div>
      </div>
    );
  }

  return (
    <div className="dpm-page">
      <button className="dpm-back" onClick={() => navigate("/medecin/patients")}>
        ← Retour à mes patients
      </button>

      <header className="dpm-patient-header">
        <img
          src={dossier.patient?.photo || "https://i.pravatar.cc/100?img=47"}
          alt={dossier.patient?.nom}
        />
        <div>
          <h1>{dossier.patient?.nom}</h1>
          <p>{dossier.patient?.email}</p>
        </div>
      </header>

      <div className="dpm-grid">
        {/* ================= AJOUTER DIAGNOSTIC ================= */}
        <form className="dpm-card" onSubmit={ajouterDiagnostic}>
          <h3>🩺 Ajouter un diagnostic</h3>

          {messageDiag && <div className="dpm-message">{messageDiag}</div>}

          <label>Catégorie</label>
          <select value={categorie} onChange={(e) => setCategorie(e.target.value)}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <label>Description</label>
          <textarea
            placeholder="Décrivez le diagnostic..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />

          <button type="submit" disabled={isSavingDiag}>
            {isSavingDiag ? "Ajout..." : "Ajouter le diagnostic"}
          </button>
        </form>

        {/* ================= AJOUTER PRESCRIPTION ================= */}
        <form className="dpm-card" onSubmit={ajouterPrescription}>
          <h3>💊 Ajouter une prescription</h3>

          {messagePresc && <div className="dpm-message">{messagePresc}</div>}

          <label>Médicament</label>
          <input
            type="text"
            placeholder="Ex: Amoxicilline"
            value={medicament}
            onChange={(e) => setMedicament(e.target.value)}
            required
          />

          <label>Dosage</label>
          <input
            type="text"
            placeholder="Ex: 500mg, 2 fois/jour"
            value={dosage}
            onChange={(e) => setDosage(e.target.value)}
            required
          />

          <label>Durée</label>
          <input
            type="text"
            placeholder="Ex: 7 jours"
            value={duree}
            onChange={(e) => setDuree(e.target.value)}
            required
          />

          <button type="submit" disabled={isSavingPresc}>
            {isSavingPresc ? "Ajout..." : "Ajouter la prescription"}
          </button>
        </form>

        {/* ================= HISTORIQUE ================= */}
        <div className="dpm-card dpm-history">
          <h3>📁 Documents</h3>
          {dossier.documents?.length === 0 ? (
            <p className="dpm-empty">Aucun document.</p>
          ) : (
            dossier.documents.map((doc) => (
              <div className="dpm-history-item" key={doc._id}>
                <strong>{doc.nom}</strong>
                <p>{doc.type}</p>
                <a href={doc.fichier} target="_blank" rel="noreferrer">Voir</a>
              </div>
            ))
          )}
        </div>

        <div className="dpm-card dpm-history">
          <h3>🩺 Diagnostics posés</h3>
          {dossier.diagnostics?.length === 0 ? (
            <p className="dpm-empty">Aucun diagnostic encore.</p>
          ) : (
            dossier.diagnostics
              .slice()
              .reverse()
              .map((d) => (
                <div className={`dpm-history-item ${d.statut === "annule" ? "dpm-annule" : ""}`} key={d._id}>
                  <span className="dpm-tag">{d.categorie}</span>
                  {d.statut === "annule" && <span className="dpm-badge-annule">Annulé</span>}
                  <p>{d.description}</p>
                  <small>{new Date(d.date).toLocaleDateString("fr-FR")}</small>
                  {d.statut === "actif" && d.medecin === userId && (
                    <button
                      className="dpm-annuler-btn"
                      disabled={annulationEnCours === d._id}
                      onClick={() => annulerEntree("diagnostic", d._id)}
                    >
                      Annuler
                    </button>
                  )}
                </div>
              ))
          )}
        </div>

        <div className="dpm-card dpm-history">
          <h3>💊 Prescriptions</h3>
          {dossier.prescriptions?.length === 0 ? (
            <p className="dpm-empty">Aucune prescription encore.</p>
          ) : (
            dossier.prescriptions
              .slice()
              .reverse()
              .map((p) => (
                <div className={`dpm-history-item ${p.statut === "annule" ? "dpm-annule" : ""}`} key={p._id}>
                  {p.statut === "annule" && <span className="dpm-badge-annule">Annulée</span>}
                  <strong>{p.medicament}</strong>
                  <p>{p.dosage} — {p.duree}</p>
                  {p.statut === "actif" && p.medecin === userId && (
                    <button
                      className="dpm-annuler-btn"
                      disabled={annulationEnCours === p._id}
                      onClick={() => annulerEntree("prescription", p._id)}
                    >
                      Annuler
                    </button>
                  )}
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
}

export default DossierPatientMedecin;