import { useRef, useState } from "react";
import api from "../services/api";
import "./ParametresAdmin.css";

// ---------------------------------------------------------------------------
// À VÉRIFIER : ces valeurs doivent être identiques à celles utilisées dans
// ParametresMedecin.jsx (le backend est commun aux 3 rôles). Cherche-y les
// lignes api.put( / api.post( pour les comparer.
// ---------------------------------------------------------------------------
const URL_PROFIL = "/auth/profile"; // route qui appelle updateProfile (méthode PUT)
const URL_PHOTO = "/auth/profile/photo"; // route qui appelle uploadProfilePhoto
const METHODE_PHOTO = "post"; // "post" ou "put", comme dans la route photo
const CHAMP_PHOTO = "photo"; // nom utilisé dans upload.single("...") côté backend
const CLE_USER = "user"; // clé du localStorage où l'utilisateur connecté est gardé

const TAILLE_MAX_PHOTO = 5 * 1024 * 1024; // 5 Mo

const lireUser = () => {
  try {
    return JSON.parse(localStorage.getItem(CLE_USER)) || {};
  } catch {
    return {};
  }
};

const messageErreur = (err) =>
  err.response?.data?.message ||
  "Une erreur est survenue. Réessaie dans un instant.";

function Retour({ section, retour }) {
  if (retour.section !== section || !retour.texte) return null;
  return (
    <p
      className={`pa-retour pa-retour--${retour.type}`}
      role={retour.type === "erreur" ? "alert" : "status"}
    >
      {retour.texte}
    </p>
  );
}

export default function ParametresAdmin() {
  const [user, setUser] = useState(lireUser);
  const [infos, setInfos] = useState({
    nom: user.nom || "",
    email: user.email || "",
    telephone: user.telephone || "",
    adresse: user.adresse || "",
  });
  const [mdp, setMdp] = useState({ ancien: "", nouveau: "", confirmation: "" });
  const [retour, setRetour] = useState({ section: "", type: "", texte: "" });
  const [enCours, setEnCours] = useState("");
  const inputPhoto = useRef(null);

  const afficher = (section, type, texte) =>
    setRetour({ section, type, texte });

  // Garde le localStorage à jour et prévient AdminLayout, qui rafraîchit
  // aussitôt le nom et la photo affichés dans le menu latéral.
  const mettreAJourUser = (nouveau) => {
    const fusion = { ...lireUser(), ...nouveau };
    localStorage.setItem(CLE_USER, JSON.stringify(fusion));
    setUser(fusion);
    window.dispatchEvent(new Event("user-updated"));
  };

  const changerInfo = (e) =>
    setInfos((prec) => ({ ...prec, [e.target.name]: e.target.value }));

  const changerMdp = (e) =>
    setMdp((prec) => ({ ...prec, [e.target.name]: e.target.value }));

  const enregistrerInfos = async (e) => {
    e.preventDefault();
    if (!infos.nom.trim() || !infos.email.trim()) {
      return afficher("infos", "erreur", "Le nom et l'email sont obligatoires.");
    }
    setEnCours("infos");
    try {
      const { data } = await api.put(URL_PROFIL, infos);
      mettreAJourUser(data.user);
      afficher("infos", "succes", data.message || "Informations enregistrées.");
    } catch (err) {
      afficher("infos", "erreur", messageErreur(err));
    } finally {
      setEnCours("");
    }
  };

  const modifierMotDePasse = async (e) => {
    e.preventDefault();
    if (!mdp.ancien) {
      return afficher("mdp", "erreur", "Saisis ton mot de passe actuel.");
    }
    if (mdp.nouveau.length < 6) {
      return afficher(
        "mdp",
        "erreur",
        "Le nouveau mot de passe doit contenir au moins 6 caractères."
      );
    }
    if (mdp.nouveau !== mdp.confirmation) {
      return afficher(
        "mdp",
        "erreur",
        "La confirmation ne correspond pas au nouveau mot de passe."
      );
    }
    setEnCours("mdp");
    try {
      const { data } = await api.put(URL_PROFIL, {
        ancienMotDePasse: mdp.ancien,
        nouveauMotDePasse: mdp.nouveau,
      });
      setMdp({ ancien: "", nouveau: "", confirmation: "" });
      afficher("mdp", "succes", data.message || "Mot de passe modifié.");
    } catch (err) {
      afficher("mdp", "erreur", messageErreur(err));
    } finally {
      setEnCours("");
    }
  };

  const changerPhoto = async (e) => {
    const fichier = e.target.files?.[0];
    if (!fichier) return;
    if (!fichier.type.startsWith("image/")) {
      return afficher("photo", "erreur", "Choisis un fichier image (JPG ou PNG).");
    }
    if (fichier.size > TAILLE_MAX_PHOTO) {
      return afficher("photo", "erreur", "L'image dépasse 5 Mo.");
    }
    const donnees = new FormData();
    donnees.append(CHAMP_PHOTO, fichier);
    setEnCours("photo");
    try {
      const { data } = await api[METHODE_PHOTO](URL_PHOTO, donnees);
      mettreAJourUser(data.user);
      afficher("photo", "succes", data.message || "Photo mise à jour.");
    } catch (err) {
      afficher("photo", "erreur", messageErreur(err));
    } finally {
      setEnCours("");
      e.target.value = "";
    }
  };

  const initiale = (user.nom || "A").trim().charAt(0).toUpperCase();

  return (
    <div className="pa-page">
      <header className="pa-entete">
        <h1>Paramètres</h1>
        <p>Gère les informations de ton compte administrateur et sa sécurité.</p>
      </header>

      <section className="pa-carte" aria-labelledby="pa-titre-photo">
        <h2 id="pa-titre-photo">Photo de profil</h2>
        <div className="pa-photo">
          {user.photo ? (
            <img className="pa-avatar" src={user.photo} alt="Ta photo de profil" />
          ) : (
            <span className="pa-avatar pa-avatar--initiale" aria-hidden="true">
              {initiale}
            </span>
          )}
          <div>
            <button
              type="button"
              className="pa-bouton pa-bouton--secondaire"
              onClick={() => inputPhoto.current?.click()}
              disabled={enCours === "photo"}
            >
              {enCours === "photo" ? "Envoi en cours…" : "Changer la photo"}
            </button>
            <p className="pa-aide">Image JPG ou PNG, 5 Mo maximum.</p>
            <input
              ref={inputPhoto}
              type="file"
              accept="image/*"
              hidden
              onChange={changerPhoto}
            />
          </div>
        </div>
        <Retour section="photo" retour={retour} />
      </section>

      <section className="pa-carte" aria-labelledby="pa-titre-infos">
        <h2 id="pa-titre-infos">Informations personnelles</h2>
        <form onSubmit={enregistrerInfos} noValidate>
          <div className="pa-grille">
            <label className="pa-champ">
              <span>Nom</span>
              <input
                name="nom"
                value={infos.nom}
                onChange={changerInfo}
                autoComplete="name"
              />
            </label>
            <label className="pa-champ">
              <span>Adresse e-mail</span>
              <input
                type="email"
                name="email"
                value={infos.email}
                onChange={changerInfo}
                autoComplete="email"
              />
            </label>
            <label className="pa-champ">
              <span>Téléphone</span>
              <input
                type="tel"
                name="telephone"
                value={infos.telephone}
                onChange={changerInfo}
                autoComplete="tel"
              />
            </label>
            <label className="pa-champ">
              <span>Adresse</span>
              <input
                name="adresse"
                value={infos.adresse}
                onChange={changerInfo}
                autoComplete="street-address"
              />
            </label>
          </div>
          <Retour section="infos" retour={retour} />
          <div className="pa-actions">
            <button
              type="submit"
              className="pa-bouton"
              disabled={enCours === "infos"}
            >
              {enCours === "infos" ? "Enregistrement…" : "Enregistrer les modifications"}
            </button>
          </div>
        </form>
      </section>

      <section className="pa-carte" aria-labelledby="pa-titre-mdp">
        <h2 id="pa-titre-mdp">Mot de passe</h2>
        <form onSubmit={modifierMotDePasse} noValidate>
          <div className="pa-grille pa-grille--une">
            <label className="pa-champ">
              <span>Mot de passe actuel</span>
              <input
                type="password"
                name="ancien"
                value={mdp.ancien}
                onChange={changerMdp}
                autoComplete="current-password"
              />
            </label>
            <label className="pa-champ">
              <span>Nouveau mot de passe</span>
              <input
                type="password"
                name="nouveau"
                value={mdp.nouveau}
                onChange={changerMdp}
                autoComplete="new-password"
              />
            </label>
            <label className="pa-champ">
              <span>Confirmer le nouveau mot de passe</span>
              <input
                type="password"
                name="confirmation"
                value={mdp.confirmation}
                onChange={changerMdp}
                autoComplete="new-password"
              />
            </label>
          </div>
          <p className="pa-aide">6 caractères minimum.</p>
          <Retour section="mdp" retour={retour} />
          <div className="pa-actions">
            <button
              type="submit"
              className="pa-bouton"
              disabled={enCours === "mdp"}
            >
              {enCours === "mdp" ? "Modification…" : "Modifier le mot de passe"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}