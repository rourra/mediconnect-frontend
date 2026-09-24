import { Link } from "react-router-dom";
import "./StatistiquesAdmin.css";

// Couleurs des barres de spécialités (dans l'ordre d'affichage).
const COULEURS = [
  "#4f46e5",
  "#06b6d4",
  "#10b981",
  "#f59e0b",
  "#f43f5e",
  "#8b5cf6",
];

const SANS_SPECIALITE = "Non renseignée";
const MAX_SPECIALITES = 6;

const pluriel = (n, singulier, plurielTexte) =>
  n > 1 ? plurielTexte : singulier;

// Graphique en anneau dessiné en SVG (aucune bibliothèque nécessaire).
function Anneau({ segments, centre, legende }) {
  const total = segments.reduce((somme, s) => somme + s.total, 0);
  const rayon = 42;
  const circonference = 2 * Math.PI * rayon;
  let cumul = 0;

  const resume = segments
    .map((s) => `${s.total} ${s.libelle.toLowerCase()}`)
    .join(", ");

  return (
    <div className="sa-anneau-bloc">
      <svg
        className="sa-anneau"
        viewBox="0 0 120 120"
        role="img"
        aria-label={`Répartition des comptes : ${resume}`}
      >
        <circle className="sa-anneau-fond" cx="60" cy="60" r={rayon} />
        {segments.map((s) => {
          const longueur = (s.total / total) * circonference;
          const cercle = (
            <circle
              key={s.cle}
              className="sa-anneau-segment"
              cx="60"
              cy="60"
              r={rayon}
              stroke={s.couleur}
              strokeDasharray={`${longueur} ${circonference - longueur}`}
              strokeDashoffset={-cumul}
              transform="rotate(-90 60 60)"
            />
          );
          cumul += longueur;
          return cercle;
        })}
        <text x="60" y="60" textAnchor="middle" className="sa-anneau-nombre">
          {centre}
        </text>
        <text x="60" y="76" textAnchor="middle" className="sa-anneau-legende">
          {legende}
        </text>
      </svg>

      <ul className="sa-anneau-liste">
        {segments.map((s) => (
          <li key={s.cle} style={{ "--sa-couleur": s.couleur }}>
            <span className="sa-pastille" aria-hidden="true" />
            <span className="sa-anneau-nom">{s.libelle}</span>
            <strong>{s.total}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Utilisation dans DashboardAdmin :
//   <StatistiquesAdmin utilisateurs={utilisateurs} />
// (la liste complète renvoyée par /users/admin/utilisateurs)
export default function StatistiquesAdmin({ utilisateurs = [] }) {
  const comptes = utilisateurs.filter((u) => u.role !== "admin");
  const patients = comptes.filter((u) => u.role === "patient");
  const medecins = comptes.filter((u) => u.role === "medecin");
  const valides = medecins.filter((m) => m.statutValidation === "valide");
  const enAttente = medecins.filter((m) => m.statutValidation === "en_attente");
  const refuses = medecins.filter((m) => m.statutValidation === "refuse");
  const desactives = comptes.filter((u) => u.statutCompte === "desactive");
  const sansSpecialite = valides.filter((m) => !(m.specialite || "").trim());

  // ---- Répartition des comptes (anneau) ----
  const segments = [
    { cle: "patients", libelle: "Patients", couleur: "#4f46e5", total: patients.length },
    { cle: "valides", libelle: "Médecins validés", couleur: "#10b981", total: valides.length },
    { cle: "attente", libelle: "Médecins en attente", couleur: "#f59e0b", total: enAttente.length },
    { cle: "refuses", libelle: "Médecins refusés", couleur: "#f43f5e", total: refuses.length },
  ].filter((s) => s.total > 0);

  // ---- Médecins validés par spécialité ----
  // Regroupement sans tenir compte des majuscules ("cardiologue" = "Cardiologue").
  const groupes = {};
  valides.forEach((m) => {
    const brut = (m.specialite || "").trim();
    const nom = brut || SANS_SPECIALITE;
    const cle = nom.toLocaleLowerCase("fr");
    if (!groupes[cle]) {
      groupes[cle] = {
        nom: nom.charAt(0).toLocaleUpperCase("fr") + nom.slice(1),
        total: 0,
      };
    }
    groupes[cle].total += 1;
  });

  let specialites = Object.values(groupes).sort((a, b) => b.total - a.total);
  if (specialites.length > MAX_SPECIALITES) {
    const reste = specialites
      .slice(MAX_SPECIALITES - 1)
      .reduce((somme, s) => somme + s.total, 0);
    specialites = [
      ...specialites.slice(0, MAX_SPECIALITES - 1),
      { nom: "Autres", total: reste },
    ];
  }

  // ---- Diagnostic de la plateforme ----
  const points = [
    enAttente.length > 0
      ? {
          niveau: "alerte",
          icone: "⚠️",
          texte: `${enAttente.length} ${pluriel(
            enAttente.length,
            "médecin attend",
            "médecins attendent"
          )} votre validation.`,
        }
      : {
          niveau: "ok",
          icone: "✅",
          texte: "Aucun médecin en attente de validation.",
        },
    sansSpecialite.length > 0
      ? {
          niveau: "alerte",
          icone: "⚠️",
          texte: `${sansSpecialite.length} ${pluriel(
            sansSpecialite.length,
            "médecin validé n'a pas",
            "médecins validés n'ont pas"
          )} de spécialité renseignée : les patients auront du mal à les trouver.`,
        }
      : {
          niveau: "ok",
          icone: "✅",
          texte: "Tous les médecins validés ont une spécialité renseignée.",
        },
    desactives.length > 0
      ? {
          niveau: "info",
          icone: "ℹ️",
          texte: `${desactives.length} ${pluriel(
            desactives.length,
            "compte désactivé",
            "comptes désactivés"
          )} sur la plateforme.`,
        }
      : {
          niveau: "ok",
          icone: "✅",
          texte: "Aucun compte désactivé.",
        },
    refuses.length > 0
      ? {
          niveau: "info",
          icone: "ℹ️",
          texte: `${refuses.length} ${pluriel(
            refuses.length,
            "demande médecin refusée",
            "demandes médecin refusées"
          )}.`,
        }
      : null,
  ].filter(Boolean);

  const nbAlertes = points.filter((p) => p.niveau === "alerte").length;

  return (
    <div className="sa-grille">
      {/* ---------- Répartition des comptes ---------- */}
      <section className="admin-card sa-carte" aria-labelledby="sa-titre-comptes">
        <div className="sa-tete">
          <h3 id="sa-titre-comptes">🧩 Répartition des comptes</h3>
        </div>

        {segments.length === 0 ? (
          <p className="empty-state">Aucun compte pour le moment.</p>
        ) : (
          <Anneau segments={segments} centre={comptes.length} legende="comptes" />
        )}

        {desactives.length > 0 && (
          <p className="sa-note">
            dont {desactives.length}{" "}
            {pluriel(desactives.length, "compte désactivé", "comptes désactivés")}
          </p>
        )}

        <Link to="/admin/utilisateurs" className="sa-lien">
          Gérer les utilisateurs →
        </Link>
      </section>

      {/* ---------- Médecins par spécialité ---------- */}
      <section className="admin-card sa-carte" aria-labelledby="sa-titre-spec">
        <div className="sa-tete">
          <h3 id="sa-titre-spec">🩺 Médecins par spécialité</h3>
          {valides.length > 0 && (
            <span className="sa-total">
              {valides.length} {pluriel(valides.length, "validé", "validés")}
            </span>
          )}
        </div>

        {specialites.length === 0 ? (
          <p className="empty-state">Aucun médecin validé pour le moment.</p>
        ) : (
          <ul className="sa-barres">
            {specialites.map((s, i) => {
              const pourcentage = Math.round((s.total / valides.length) * 100);
              return (
                <li
                  key={s.nom}
                  className="sa-barre-ligne"
                  style={{ "--sa-couleur": COULEURS[i % COULEURS.length] }}
                >
                  <div className="sa-barre-infos">
                    <span className="sa-barre-nom">
                      <span className="sa-pastille" aria-hidden="true" />
                      {s.nom}
                    </span>
                    <span className="sa-barre-valeurs">
                      <strong>{s.total}</strong>
                      <span className="sa-barre-pct">{pourcentage} %</span>
                    </span>
                  </div>
                  <div className="sa-barre-piste" aria-hidden="true">
                    <div
                      className="sa-barre-remplie"
                      style={{ width: `${pourcentage}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* ---------- Diagnostic de la plateforme ---------- */}
      <section className="admin-card sa-carte" aria-labelledby="sa-titre-diag">
        <div className="sa-tete">
          <h3 id="sa-titre-diag">🔎 Diagnostic de la plateforme</h3>
          <span
            className={`sa-total ${nbAlertes > 0 ? "sa-total--alerte" : "sa-total--ok"}`}
          >
            {nbAlertes > 0
              ? `${nbAlertes} ${pluriel(nbAlertes, "point à traiter", "points à traiter")}`
              : "Tout est en ordre"}
          </span>
        </div>

        <ul className="sa-points">
          {points.map((p) => (
            <li key={p.texte} className={`sa-point sa-point--${p.niveau}`}>
              <span className="sa-point-icone" aria-hidden="true">
                {p.icone}
              </span>
              <span>{p.texte}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}