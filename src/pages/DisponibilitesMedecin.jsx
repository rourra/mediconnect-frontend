import { useEffect, useState } from "react";
import api from "../services/api";
import "./DisponibilitesMedecin.css";

const LABELS_JOURS = {
  lundi: "Lundi",
  mardi: "Mardi",
  mercredi: "Mercredi",
  jeudi: "Jeudi",
  vendredi: "Vendredi",
  samedi: "Samedi",
  dimanche: "Dimanche",
};

function DisponibilitesMedecin() {
  const [disponibilites, setDisponibilites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    const charger = async () => {
      try {
        const res = await api.get("/disponibilites/mes-disponibilites");
        setDisponibilites(res.data);
      } catch (error) {
        setErreur(error.response?.data?.message || "Erreur de chargement");
      } finally {
        setIsLoading(false);
      }
    };
    charger();
  }, []);

  const modifierJour = (jour, champ, valeur) => {
    setDisponibilites((prev) =>
      prev.map((d) => (d.jour === jour ? { ...d, [champ]: valeur } : d))
    );
  };

  const enregistrer = async (e) => {
    e.preventDefault();
    setMessage("");
    setErreur("");
    setIsSaving(true);

    try {
      await api.put("/disponibilites/mes-disponibilites", { disponibilites });
      setMessage("Disponibilités mises à jour avec succès.");
    } catch (error) {
      setErreur(error.response?.data?.message || "Erreur lors de l'enregistrement");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="dispomed-loading">Chargement...</div>;
  }

  return (
    <div className="dispomed-page">
      <header className="dispomed-header">
        <h1>🗓️ Mes disponibilités</h1>
        <p>Définissez vos horaires de consultation par jour de la semaine. Les patients ne pourront réserver que dans ces créneaux.</p>
      </header>

      <form className="dispomed-card" onSubmit={enregistrer}>
        {message && <div className="dispomed-success">{message}</div>}
        {erreur && <div className="dispomed-error">{erreur}</div>}

        {disponibilites.map((d) => (
          <div className="dispomed-row" key={d.jour}>
            <label className="dispomed-toggle">
              <input
                type="checkbox"
                checked={d.actif}
                onChange={(e) => modifierJour(d.jour, "actif", e.target.checked)}
              />
              <span>{LABELS_JOURS[d.jour]}</span>
            </label>

            {d.actif ? (
              <div className="dispomed-heures">
                <input
                  type="time"
                  value={d.heureDebut}
                  onChange={(e) => modifierJour(d.jour, "heureDebut", e.target.value)}
                />
                <span>à</span>
                <input
                  type="time"
                  value={d.heureFin}
                  onChange={(e) => modifierJour(d.jour, "heureFin", e.target.value)}
                />
              </div>
            ) : (
              <span className="dispomed-ferme">Fermé</span>
            )}
          </div>
        ))}

        <button type="submit" disabled={isSaving}>
          {isSaving ? "Enregistrement..." : "Enregistrer mes disponibilités"}
        </button>
      </form>
    </div>
  );
}

export default DisponibilitesMedecin;