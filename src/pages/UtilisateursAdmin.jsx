import { useEffect, useState } from "react";
import api from "../services/api";
import GestionUtilisateurs from "../components/GestionUtilisateurs";
import "./UtilisateursAdmin.css";

function UtilisateursAdmin() {
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionEnCours, setActionEnCours] = useState(null);
  const [message, setMessage] = useState("");
  const [onglet, setOnglet] = useState("actifs");

  useEffect(() => {
    const chargerUtilisateurs = async () => {
      try {
        const res = await api.get("/users/admin/utilisateurs");
        setUtilisateurs(res.data);
      } catch (error) {
        console.error("Erreur chargement utilisateurs :", error);
        setMessage("Impossible de charger la liste des utilisateurs.");
      } finally {
        setIsLoading(false);
      }
    };

    chargerUtilisateurs();
  }, []);

  // Les comptes administrateur ne sont pas gérés depuis cette page.
  const comptes = utilisateurs.filter((u) => u.role !== "admin");
  const desactives = comptes.filter((u) => u.statutCompte === "desactive");
  const actifs = comptes.filter((u) => u.statutCompte !== "desactive");

  const handleToggleCompte = async (utilisateur) => {
    const action =
      utilisateur.statutCompte === "desactive" ? "reactiver" : "desactiver";
    const confirmMsg =
      action === "desactiver"
        ? `Désactiver le compte de ${utilisateur.nom} ?`
        : `Réactiver le compte de ${utilisateur.nom} ?`;

    if (!window.confirm(confirmMsg)) return;

    setActionEnCours(utilisateur._id);
    setMessage("");
    try {
      await api.put(`/users/admin/${action}/${utilisateur._id}`);
      setUtilisateurs((prev) =>
        prev.map((u) =>
          u._id === utilisateur._id
            ? {
                ...u,
                statutCompte: action === "desactiver" ? "desactive" : "actif",
              }
            : u
        )
      );
      setMessage(
        action === "desactiver" ? "Compte désactivé." : "Compte réactivé."
      );
    } catch (error) {
      setMessage(error.response?.data?.message || "Erreur lors de l'opération");
    } finally {
      setActionEnCours(null);
    }
  };

  const afficheActifs = onglet === "actifs";

  return (
    <>
      <header className="admin-topbar">
        <div>
          <h1>Utilisateurs 👥</h1>
          <p>Consultez les comptes actifs et désactivés de la plateforme.</p>
        </div>
      </header>

      {isLoading ? (
        <div className="dashboard-loading">Chargement...</div>
      ) : (
        <>
          {message && <div className="admin-message">{message}</div>}

          <section className="admin-card">
            <div className="ua-onglets" role="group" aria-label="État du compte">
              <button
                type="button"
                className={`ua-onglet${afficheActifs ? " ua-onglet--actif" : ""}`}
                aria-pressed={afficheActifs}
                onClick={() => setOnglet("actifs")}
              >
                Comptes actifs
                <span className="ua-compte">{actifs.length}</span>
              </button>

              <button
                type="button"
                className={`ua-onglet${!afficheActifs ? " ua-onglet--actif" : ""}`}
                aria-pressed={!afficheActifs}
                onClick={() => setOnglet("desactives")}
              >
                Comptes désactivés
                <span className="ua-compte">{desactives.length}</span>
              </button>
            </div>

            <p className="ua-aide">
              {afficheActifs
                ? "Désactivez un compte en cas d'abus : il ne pourra plus se connecter, mais ses données sont conservées."
                : "Ces comptes ne peuvent plus se connecter. Vous pouvez les réactiver à tout moment."}
            </p>

            <GestionUtilisateurs
              utilisateurs={afficheActifs ? actifs : desactives}
              onToggle={handleToggleCompte}
              actionEnCours={actionEnCours}
              qualificatif={afficheActifs ? "actif" : "désactivé"}
            />
          </section>
        </>
      )}
    </>
  );
}

export default UtilisateursAdmin;