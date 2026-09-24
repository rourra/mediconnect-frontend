import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./MesPatients.css";

function MesPatients() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [recherche, setRecherche] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const charger = async () => {
      try {
        const res = await api.get("/messages/contacts");
        setPatients(res.data);
      } catch (error) {
        console.error("Erreur chargement patients :", error);
      } finally {
        setIsLoading(false);
      }
    };
    charger();
  }, []);

  const patientsFiltres = patients.filter((p) =>
    p.nom?.toLowerCase().includes(recherche.toLowerCase())
  );

  return (
    <div className="mespat-page">
      <header className="mespat-header">
        <h1>👥 Mes patients</h1>
        <p>Consultez le dossier médical de vos patients suivis.</p>
      </header>

      {patients.length > 0 && (
        <input
          type="text"
          className="mespat-search"
          placeholder="🔍 Rechercher un patient..."
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
        />
      )}

      {isLoading ? (
        <div className="mespat-loading">Chargement...</div>
      ) : patients.length === 0 ? (
        <div className="mespat-empty">
          Aucun patient pour l'instant. Les patients apparaîtront ici une fois
          leur invitation acceptée.
        </div>
      ) : (
        <div className="mespat-grid">
          {patientsFiltres.map((p) => (
            <div
              key={p._id}
              className="mespat-card"
              onClick={() => navigate(`/medecin/patients/${p._id}`)}
            >
              <img src={p.photo || "https://i.pravatar.cc/100?img=47"} alt={p.nom} />
              <div>
                <strong>{p.nom}</strong>
                <p>{p.email}</p>
              </div>
              <span className="mespat-arrow">→</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MesPatients;