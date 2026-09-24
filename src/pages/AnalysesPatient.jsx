import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function AnalysesPatient() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  const chargerAnalyses = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/dossiers/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const docs = res.data.documents || [];

      const analyses = docs.filter((doc) =>
        ["analyse", "analyses", "radio", "scanner", "examen", "pdf"].includes(
          doc.type?.toLowerCase()
        )
      );

      setDocuments(analyses);
    } catch (error) {
      console.log("Erreur analyses :", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    chargerAnalyses();
  }, []);

  if (loading) {
    return (
      <div className="analyse-page">
        <h2>Chargement des analyses...</h2>
      </div>
    );
  }

  return (
    <div className="analyse-page">
      <button className="back-btn" onClick={() => navigate("/patient")}>
        ← Retour
      </button>

      <h1>🧪 Mes analyses & examens</h1>

      {documents.length === 0 ? (
        <div className="analyse-card">
          <p>Aucune analyse ou examen disponible pour le moment.</p>
        </div>
      ) : (
        documents.map((doc) => (
          <div className="analyse-card" key={doc._id}>
            <h2>{doc.nom}</h2>

            <p>
              <strong>Type :</strong> {doc.type}
            </p>

            <p>
              <strong>Fichier :</strong> {doc.fichier}
            </p>

            {doc.dateAjout && (
              <p>
                <strong>Date d’ajout :</strong>{" "}
                {new Date(doc.dateAjout).toLocaleDateString()}
              </p>
            )}

            <button>Voir / Télécharger</button>
          </div>
        ))
      )}
    </div>
  );
}

export default AnalysesPatient;