import { useEffect, useState } from "react";
import api from "../services/api";
import "./DossierPatient.css";

function DossierPatient() {
  const [dossier, setDossier] = useState(null);
  const [loading, setLoading] = useState(true);

  const [nom, setNom] = useState("");
  const [type, setType] = useState("");
  const [fichier, setFichier] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [erreurUpload, setErreurUpload] = useState("");

  const user = JSON.parse(localStorage.getItem("user")) || {};

  const chargerDossier = async () => {
    try {
      setLoading(true);

      try {
        const res = await api.get("/dossiers/me");
        setDossier(res.data);
      } catch (error) {
        if (error.response?.status === 404) {
          await api.post("/dossiers/create", {});
          const res2 = await api.get("/dossiers/me");
          setDossier(res2.data);
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error("Erreur chargement dossier :", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    chargerDossier();
  }, []);

  const ajouterDocument = async (e) => {
    e.preventDefault();
    setErreurUpload("");

    if (!nom || !type || !fichier) {
      setErreurUpload("Veuillez remplir tous les champs et choisir un fichier.");
      return;
    }

    const formData = new FormData();
    formData.append("nom", nom);
    formData.append("type", type);
    formData.append("fichier", fichier);

    setIsUploading(true);
    try {
      await api.post("/dossiers/document", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setNom("");
      setType("");
      setFichier(null);
      document.getElementById("dossier-file-input").value = "";

      await chargerDossier();
    } catch (error) {
      setErreurUpload(
        error.response?.data?.message || "Erreur lors de l'ajout du document"
      );
    } finally {
      setIsUploading(false);
    }
  };

  const supprimerDocument = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer ce document ?")) return;

    try {
      await api.delete(`/dossiers/document/${id}`);
      await chargerDossier();
    } catch (error) {
      alert(error.response?.data?.message || "Erreur lors de la suppression");
    }
  };

  if (loading) {
    return <div className="dossierpat-page dossierpat-loading">Chargement du dossier médical...</div>;
  }

  return (
    <div className="dossierpat-page">
      <header className="dossierpat-header">
        <h1>📁 Mon dossier médical</h1>
        <p>Gérez vos documents, diagnostics et prescriptions médicales.</p>
      </header>

      <div className="dossierpat-top">
        <div className="dossierpat-profile">
          <img src={user.photo || "https://i.pravatar.cc/150?img=47"} alt="profil" />
          <h2>{user.nom}</h2>
          <p>{user.email}</p>

          <div className="dossierpat-info">
            <span>Téléphone</span>
            <strong>{user.telephone || "Non renseigné"}</strong>
          </div>
          <div className="dossierpat-info">
            <span>Adresse</span>
            <strong>{user.adresse || "Non renseignée"}</strong>
          </div>
          <div className="dossierpat-info">
            <span>Date de naissance</span>
            <strong>{user.dateNaissance || "Non renseignée"}</strong>
          </div>
        </div>

        <div className="dossierpat-upload">
          <h2>➕ Ajouter un document médical</h2>
          <p>Formats acceptés : PDF, JPEG, PNG, WEBP — 10 Mo max.</p>

          <form onSubmit={ajouterDocument}>
            {erreurUpload && <div className="dossierpat-error">{erreurUpload}</div>}

            <label>Nom du document</label>
            <input
              type="text"
              placeholder="Ex : Analyse sanguine"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
            />

            <label>Type</label>
            <select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="">Choisir un type</option>
              <option value="Analyse">Analyse</option>
              <option value="Ordonnance">Ordonnance</option>
              <option value="Radiologie">Radiologie</option>
              <option value="Compte rendu">Compte rendu</option>
              <option value="Autre">Autre</option>
            </select>

            <label>Fichier</label>
            <input
              id="dossier-file-input"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              onChange={(e) => setFichier(e.target.files[0])}
            />

            <button type="submit" disabled={isUploading}>
              {isUploading ? "Envoi..." : "📤 Ajouter"}
            </button>
          </form>
        </div>
      </div>

      <div className="dossierpat-grid">
        <div className="dossierpat-box">
          <div className="dossierpat-box-title">
            <span>📄</span>
            <div>
              <h2>Documents médicaux</h2>
              <p>{dossier?.documents?.length || 0} document(s)</p>
            </div>
          </div>

          {dossier?.documents?.length ? (
            dossier.documents.map((doc) => (
              <div className="dossierpat-row" key={doc._id}>
                <div className="dossierpat-file-icon">📎</div>
                <div className="dossierpat-row-info">
                  <h3>{doc.nom}</h3>
                  <p>{doc.type}</p>
                  <a href={doc.fichier} target="_blank" rel="noreferrer">
                    Voir le fichier
                  </a>
                </div>
                <button onClick={() => supprimerDocument(doc._id)}>🗑</button>
              </div>
            ))
          ) : (
            <p className="dossierpat-empty">Aucun document ajouté pour le moment.</p>
          )}
        </div>

        <div className="dossierpat-box">
          <div className="dossierpat-box-title">
            <span>🩺</span>
            <div>
              <h2>Diagnostics</h2>
              <p>{dossier?.diagnostics?.length || 0} diagnostic(s)</p>
            </div>
          </div>

          {dossier?.diagnostics?.length ? (
            dossier.diagnostics.map((d, index) => (
              <div className="dossierpat-row" key={d._id || index}>
                <div className="dossierpat-file-icon">🩻</div>
                <div className="dossierpat-row-info">
                  <h3>
                    Diagnostic du {new Date(d.date).toLocaleDateString("fr-FR")}
                    {d.statut === "annule" && (
                      <span className="dossierpat-badge-annule">Annulé</span>
                    )}
                  </h3>
                  <p>{d.description}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="dossierpat-empty">
              Les diagnostics ajoutés par votre médecin apparaîtront ici.
            </p>
          )}
        </div>

        <div className="dossierpat-box">
          <div className="dossierpat-box-title">
            <span>💊</span>
            <div>
              <h2>Prescriptions</h2>
              <p>{dossier?.prescriptions?.length || 0} prescription(s)</p>
            </div>
          </div>

          {dossier?.prescriptions?.length ? (
            dossier.prescriptions.map((p, index) => (
              <div className="dossierpat-row" key={p._id || index}>
                <div className="dossierpat-file-icon">🧾</div>
                <div className="dossierpat-row-info">
                  <h3>
                    {p.medicament}
                    {p.statut === "annule" && (
                      <span className="dossierpat-badge-annule">Annulée</span>
                    )}
                  </h3>
                  <p>Dosage : {p.dosage}</p>
                  <small>Durée : {p.duree}</small>
                </div>
              </div>
            ))
          ) : (
            <p className="dossierpat-empty">
              Les ordonnances rédigées par votre médecin apparaîtront ici.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default DossierPatient;