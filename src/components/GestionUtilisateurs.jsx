import { useMemo, useState } from "react";
import ListeUtilisateurs from "./ListeUtilisateurs";
import "./GestionUtilisateurs.css";

// Recherche insensible aux majuscules et aux accents ("helene" trouve "Hélène").
const normaliser = (texte) =>
  (texte || "")
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

// Utilisation dans DashboardAdmin :
//   <GestionUtilisateurs utilisateurs={liste} onToggle={handleToggleCompte}
//                        actionEnCours={actionEnCours} />
export default function GestionUtilisateurs({
  utilisateurs = [],
  onToggle,
  actionEnCours = null,
  qualificatif = "inscrit",
}) {
  const [recherche, setRecherche] = useState("");
  const terme = normaliser(recherche);

  const medecins = useMemo(
    () => utilisateurs.filter((u) => u.role === "medecin"),
    [utilisateurs]
  );
  const patients = useMemo(
    () => utilisateurs.filter((u) => u.role === "patient"),
    [utilisateurs]
  );

  const filtrer = (liste) =>
    terme
      ? liste.filter(
          (u) =>
            normaliser(u.nom).includes(terme) ||
            normaliser(u.email).includes(terme)
        )
      : liste;

  const medecinsTrouves = filtrer(medecins);
  const patientsTrouves = filtrer(patients);
  const totalTrouves = medecinsTrouves.length + patientsTrouves.length;

  const compteur = (trouves, total) =>
    terme ? `${trouves} sur ${total}` : String(total);

  return (
    <div className="gu">
      <div className="gu-recherche">
        <span className="gu-loupe" aria-hidden="true">
          🔍
        </span>
        <input
          type="search"
          className="gu-champ"
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          placeholder="Rechercher un utilisateur par nom"
          aria-label="Rechercher un utilisateur par nom"
          autoComplete="off"
        />
        {recherche && (
          <button
            type="button"
            className="gu-effacer"
            onClick={() => setRecherche("")}
          >
            Effacer
          </button>
        )}
      </div>

      {terme && (
        <p className="gu-resume" role="status">
          {totalTrouves === 0
            ? `Aucun résultat pour « ${recherche.trim()} ».`
            : `${totalTrouves} résultat${totalTrouves > 1 ? "s" : ""} pour « ${recherche.trim()} ».`}
        </p>
      )}

      <section className="gu-groupe" aria-labelledby="gu-titre-medecins">
        <h4 id="gu-titre-medecins" className="gu-titre">
          Médecins
          <span className="gu-compteur">
            {compteur(medecinsTrouves.length, medecins.length)}
          </span>
        </h4>
        <ListeUtilisateurs
          utilisateurs={medecinsTrouves}
          onToggle={onToggle}
          actionEnCours={actionEnCours}
          messageVide={
            terme
              ? "Aucun médecin ne correspond à cette recherche."
              : `Aucun médecin ${qualificatif} pour le moment.`
          }
        />
      </section>

      <section className="gu-groupe" aria-labelledby="gu-titre-patients">
        <h4 id="gu-titre-patients" className="gu-titre">
          Patients
          <span className="gu-compteur">
            {compteur(patientsTrouves.length, patients.length)}
          </span>
        </h4>
        <ListeUtilisateurs
          utilisateurs={patientsTrouves}
          onToggle={onToggle}
          actionEnCours={actionEnCours}
          messageVide={
            terme
              ? "Aucun patient ne correspond à cette recherche."
              : `Aucun patient ${qualificatif} pour le moment.`
          }
        />
      </section>
    </div>
  );
}