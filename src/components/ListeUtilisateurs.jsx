import "./ListeUtilisateurs.css";

const LIBELLES_ROLE = {
  medecin: "Médecin",
  patient: "Patient",
  admin: "Administrateur",
};

// Utilisation dans ta page admin :
//   <ListeUtilisateurs utilisateurs={liste} onToggle={handleToggleCompte}
//                      actionEnCours={actionEnCours} />
// onToggle reçoit l'utilisateur cliqué ; actionEnCours est l'id de
// l'utilisateur en cours de traitement (son bouton est alors désactivé).
export default function ListeUtilisateurs({
  utilisateurs = [],
  onToggle,
  actionEnCours = null,
  messageVide = "Aucun utilisateur pour le moment.",
}) {
  if (utilisateurs.length === 0) {
    return <p className="lu-vide">{messageVide}</p>;
  }

  return (
    <ul className="lu-liste">
      {utilisateurs.map((u) => {
        const id = u._id || u.id;
        const desactive = u.statutCompte === "desactive";
        const enCours = actionEnCours === id;
        const nomAffiche =
          u.role === "medecin" && !/^dr\b/i.test(u.nom) ? `Dr. ${u.nom}` : u.nom;
        const initiale = (u.nom || "?").trim().charAt(0).toUpperCase();

        return (
          <li
            key={id}
            className={`lu-carte${desactive ? " lu-carte--inactive" : ""}`}
          >
            {u.photo ? (
              <img className="lu-avatar" src={u.photo} alt="" />
            ) : (
              <span className="lu-avatar lu-avatar--initiale" aria-hidden="true">
                {initiale}
              </span>
            )}

            <div className="lu-infos">
              <p className="lu-nom">{nomAffiche}</p>
              <p className="lu-email">{u.email}</p>
              <div className="lu-pastilles">
                <span className={`lu-pastille lu-role lu-role--${u.role}`}>
                  {LIBELLES_ROLE[u.role] || u.role}
                </span>
                <span
                  className={`lu-pastille lu-statut ${
                    desactive ? "lu-statut--desactive" : "lu-statut--actif"
                  }`}
                >
                  {desactive ? "Désactivé" : "Actif"}
                </span>
              </div>
            </div>

            {u.role !== "admin" && (
              <button
                type="button"
                className={`lu-bouton ${
                  desactive ? "lu-bouton--reactiver" : "lu-bouton--desactiver"
                }`}
                disabled={enCours}
                onClick={() => onToggle && onToggle(u)}
                aria-label={`${desactive ? "Réactiver" : "Désactiver"} le compte de ${nomAffiche}`}
              >
                {enCours ? "..." : desactive ? "Réactiver" : "Désactiver"}
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}