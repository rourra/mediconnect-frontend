import { useEffect, useState } from "react";
import api from "../services/api";
import "./MedecinsPatient.css";

function MedecinsPatient() {
  const [medecins, setMedecins] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [envoiEnCours, setEnvoiEnCours] = useState(null);
  const [message, setMessage] = useState("");

  const chargerDonnees = async () => {
    try {
      const [resMedecins, resInvitations] = await Promise.all([
        api.get("/users/medecins"),
        api.get("/invitations/patient/mes-invitations"),
      ]);
      setMedecins(resMedecins.data);
      setInvitations(resInvitations.data);
    } catch (error) {
      console.error("Erreur chargement médecins :", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    chargerDonnees();
  }, []);

  const statutInvitation = (medecinId) => {
    const inv = invitations.find((i) => i.medecin === medecinId);
    return inv?.statut || null;
  };

  const envoyerInvitation = async (medecinId) => {
    setEnvoiEnCours(medecinId);
    setMessage("");
    try {
      await api.post("/invitations/send", { medecinId });
      setMessage("Invitation envoyée avec succès.");
      await chargerDonnees();
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Erreur lors de l'envoi de l'invitation"
      );
    } finally {
      setEnvoiEnCours(null);
    }
  };

  const medecinsFiltres = medecins.filter((m) =>
    `${m.nom} ${m.specialite}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="docpat-page">
      <header className="docpat-header">
        <h1>👨‍⚕️ Trouver un médecin</h1>
        <p>Recherchez un médecin et envoyez-lui une demande de suivi.</p>
      </header>

      <input
        className="docpat-search"
        type="text"
        placeholder="🔍 Rechercher par nom ou spécialité..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {message && <div className="docpat-message">{message}</div>}

      {isLoading ? (
        <div className="docpat-loading">Chargement...</div>
      ) : medecinsFiltres.length === 0 ? (
        <div className="docpat-empty">Aucun médecin trouvé.</div>
      ) : (
        <div className="docpat-grid">
          {medecinsFiltres.map((m) => {
            const statut = statutInvitation(m._id);

            return (
              <div className="docpat-card" key={m._id}>
                <img
                  src={m.photo || "https://i.pravatar.cc/100?img=12"}
                  alt={m.nom}
                />

                <h3>Dr. {m.nom}</h3>
                <p className="docpat-specialite">
                  {m.specialite || "Médecin généraliste"}
                </p>
                <p className="docpat-email">{m.email}</p>

                {statut === "acceptee" ? (
                  <button className="docpat-btn accepted" disabled>
                    ✅ Déjà votre médecin
                  </button>
                ) : statut === "en_attente" ? (
                  <button className="docpat-btn pending" disabled>
                    ⏳ Invitation envoyée
                  </button>
                ) : statut === "refusee" ? (
                  <button className="docpat-btn refused" disabled>
                    ❌ Invitation refusée
                  </button>
                ) : (
                  <button
                    className="docpat-btn"
                    disabled={envoiEnCours === m._id}
                    onClick={() => envoyerInvitation(m._id)}
                  >
                    {envoiEnCours === m._id ? "..." : "Envoyer une invitation"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MedecinsPatient;