import { useEffect, useState } from "react";
import axios from "axios";

function OrdonnancesPatient() {
  const [ordonnances, setOrdonnances] = useState([]);
  const [loading, setLoading] = useState(true);

  const [medicament, setMedicament] = useState("");
  const [dosage, setDosage] = useState("");
  const [prisesParJour, setPrisesParJour] = useState("");
  const [duree, setDuree] = useState("");
  const [instructions, setInstructions] = useState("");

  const token = localStorage.getItem("token");

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const chargerOrdonnances = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/ordonnances/patient",
        config
      );

      setOrdonnances(res.data);
    } catch (error) {
      console.log("Erreur chargement ordonnances :", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    chargerOrdonnances();
  }, []);

  const ajouterOrdonnance = async (e) => {
    e.preventDefault();

    if (!medicament || !dosage || !prisesParJour || !duree) {
      alert("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    try {
      await axios.post(
        "http://localhost:5000/api/ordonnances/create",
        {
          medicament,
          dosage,
          prisesParJour,
          duree,
          instructions,
        },
        config
      );

      setMedicament("");
      setDosage("");
      setPrisesParJour("");
      setDuree("");
      setInstructions("");

      chargerOrdonnances();
      alert("Ordonnance ajoutée avec succès");
    } catch (error) {
      console.log("Erreur ajout ordonnance :", error);
      alert(error.response?.data?.message || "Erreur lors de l’ajout.");
    }
  };

  const supprimerOrdonnance = async (id) => {
    if (!window.confirm("Voulez-vous supprimer cette ordonnance ?")) return;

    try {
      await axios.delete(
        `http://localhost:5000/api/ordonnances/${id}`,
        config
      );

      chargerOrdonnances();
      alert("Ordonnance supprimée");
    } catch (error) {
      console.log("Erreur suppression ordonnance :", error);
      alert(error.response?.data?.message || "Erreur lors de la suppression.");
    }
  };

  if (loading) {
    return (
      <div className="ordo-pro-page">
        <h2>Chargement des ordonnances...</h2>
      </div>
    );
  }

  return (
    <div className="ordo-pro-page">
      <div className="ordo-hero">
        <h1>🧾 Mes ordonnances</h1>
        <p>Gérez vos traitements, dosages et périodes d’utilisation.</p>
      </div>

      <div className="ordo-stats">
        <div>
          <strong>{ordonnances.length}</strong>
          <span>Total ordonnances</span>
        </div>

        <div>
          <strong>💊</strong>
          <span>Traitements actifs</span>
        </div>

        <div>
          <strong>📅</strong>
          <span>Suivi médical</span>
        </div>
      </div>

      <div className="ordo-form-card">
        <h2>➕ Ajouter une ordonnance</h2>

        <form onSubmit={ajouterOrdonnance} className="ordo-form-pro">
          <div className="ordo-field">
            <label>💊 Nom du médicament</label>
            <input
              type="text"
              placeholder="Ex : Doliprane"
              value={medicament}
              onChange={(e) => setMedicament(e.target.value)}
            />
          </div>

          <div className="ordo-field">
            <label>⚕️ Dosage</label>
            <input
              type="text"
              placeholder="Ex : 500 mg"
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
            />
          </div>

          <div className="ordo-field">
            <label>📅 Nombre de prises par jour</label>
            <input
              type="number"
              placeholder="Ex : 3"
              value={prisesParJour}
              onChange={(e) => setPrisesParJour(e.target.value)}
            />
          </div>

          <div className="ordo-field">
            <label>⏳ Durée du traitement</label>
            <input
              type="text"
              placeholder="Ex : 7 jours"
              value={duree}
              onChange={(e) => setDuree(e.target.value)}
            />
          </div>

          <div className="ordo-field full">
            <label>📝 Instructions</label>
            <textarea
              placeholder="Ex : Après les repas, matin et soir..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
            />
          </div>

          <button type="submit" className="ordo-submit-btn">
            ➕ Ajouter ordonnance
          </button>
        </form>
      </div>

      <h2 className="ordo-section-title">💊 Mes traitements</h2>

      {ordonnances.length === 0 ? (
        <div className="ordo-empty">
          <span>🧾</span>
          <h3>Aucune ordonnance</h3>
          <p>Aucune ordonnance disponible pour le moment.</p>
        </div>
      ) : (
        <div className="ordo-grid">
          {ordonnances.map((o) => (
            <div className="ordo-card" key={o._id}>
              <div className="ordo-card-header">
                <div className="ordo-icon">💊</div>

                <div>
                  <h3>{o.medicament}</h3>
                  <p>
                    {o.createdAt
                      ? new Date(o.createdAt).toLocaleDateString("fr-FR")
                      : "Date non disponible"}
                  </p>
                </div>
              </div>

              <div className="ordo-info">
                <div>
                  <span>Dosage</span>
                  <strong>{o.dosage}</strong>
                </div>

                <div>
                  <span>Prises / jour</span>
                  <strong>{o.prisesParJour}</strong>
                </div>

                <div>
                  <span>Durée</span>
                  <strong>{o.duree}</strong>
                </div>

                <div>
                  <span>Instructions</span>
                  <strong>{o.instructions || "Aucune"}</strong>
                </div>
              </div>

              <div className="ordo-actions">
                <button onClick={() => window.print()} className="print-btn">
                  🖨 Imprimer
                </button>

                <button
                  className="delete-ordo-btn"
                  onClick={() => supprimerOrdonnance(o._id)}
                >
                  🗑 Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default OrdonnancesPatient;