import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import "./DashboardMedecin.css";

// Une couleur par catégorie de diagnostic (dans l'ordre d'affichage).
const COULEURS_STATS = [
  "#4f46e5",
  "#06b6d4",
  "#10b981",
  "#f59e0b",
  "#f43f5e",
  "#8b5cf6",
  "#0ea5e9",
  "#f97316",
];

// Libellés lisibles pour les statuts de rendez-vous.
const LIBELLES_STATUT = {
  en_attente: "En attente",
  confirme: "Confirmé",
  termine: "Terminé",
  annule: "Annulé",
};

const libelleStatut = (statut) =>
  LIBELLES_STATUT[statut] || String(statut || "").replace(/_/g, " ");

const MOIS = [
  "janv.",
  "févr.",
  "mars",
  "avr.",
  "mai",
  "juin",
  "juil.",
  "août",
  "sept.",
  "oct.",
  "nov.",
  "déc.",
];

// "2026-09-11" -> { jour: "11", moisAnnee: "sept. 2026" }
// (découpage du texte : pas de décalage lié aux fuseaux horaires)
const decouperDate = (dateTexte) => {
  const [annee, mois, jour] = String(dateTexte || "").split("-");
  if (!annee || !mois || !jour) {
    return { jour: dateTexte || "—", moisAnnee: "" };
  }
  return {
    jour: String(Number(jour)),
    moisAnnee: `${MOIS[Number(mois) - 1] || mois} ${annee}`,
  };
};

// Statuts de rendez-vous affichés dans le graphique en anneau.
const STATUTS_RDV = [
  { cle: "confirme", libelle: "Confirmés", couleur: "#10b981" },
  { cle: "en_attente", libelle: "En attente", couleur: "#f59e0b" },
  { cle: "termine", libelle: "Terminés", couleur: "#4f46e5" },
  { cle: "annule", libelle: "Annulés", couleur: "#f43f5e" },
];

// Raccourcis vers les pages les plus utilisées.
const ACCES_RAPIDES = [
  { to: "/medecin/patients", icone: "👥", titre: "Mes patients", texte: "Consulter les dossiers" },
  { to: "/medecin/messages", icone: "💬", titre: "Messagerie", texte: "Répondre aux patients" },
  { to: "/medecin/disponibilites", icone: "🗓️", titre: "Disponibilités", texte: "Gérer mes horaires" },
  { to: "/medecin/invitations", icone: "📨", titre: "Invitations", texte: "Demandes de suivi" },
];

// Graphique en anneau dessiné en SVG (aucune bibliothèque nécessaire).
function DonutRdv({ segments }) {
  const total = segments.reduce((somme, s) => somme + s.total, 0);
  const rayon = 42;
  const circonference = 2 * Math.PI * rayon;
  let cumul = 0;

  const resume = segments
    .map((s) => `${s.total} ${s.libelle.toLowerCase()}`)
    .join(", ");

  return (
    <div className="donut-bloc">
      <svg
        className="donut"
        viewBox="0 0 120 120"
        role="img"
        aria-label={`Rendez-vous par statut : ${resume}`}
      >
        <circle className="donut-fond" cx="60" cy="60" r={rayon} />
        {segments.map((s) => {
          const longueur = (s.total / total) * circonference;
          const cercle = (
            <circle
              key={s.cle}
              className="donut-segment"
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
        <text x="60" y="60" textAnchor="middle" className="donut-nombre">
          {total}
        </text>
        <text x="60" y="76" textAnchor="middle" className="donut-legende">
          rendez-vous
        </text>
      </svg>

      <ul className="donut-liste">
        {segments.map((s) => (
          <li key={s.cle} style={{ "--donut-couleur": s.couleur }}>
            <span className="donut-pastille" aria-hidden="true" />
            <span className="donut-nom">{s.libelle}</span>
            <strong>{s.total}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}

function DashboardMedecin() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user")) || {};

  const [rdvs, setRdvs] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [stats, setStats] = useState({ total: 0, repartition: {} });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const chargerDonnees = async () => {
      try {
        const [resRdvs, resInvitations, resStats] = await Promise.all([
          api.get("/appointments/medecin"),
          api.get("/invitations/medecin"),
          api.get("/dossiers/statistiques/diagnostics"),
        ]);
        setRdvs(resRdvs.data);
        setInvitations(
          resInvitations.data.filter((inv) => inv.statut === "en_attente")
        );
        setStats(resStats.data);
      } catch (error) {
        console.error("Erreur chargement dashboard médecin :", error);
      } finally {
        setIsLoading(false);
      }
    };

    chargerDonnees();
  }, []);

  const rdvsAujourdhui = rdvs.filter(
    (r) => r.date === new Date().toISOString().split("T")[0]
  );

  // Catégories triées de la plus fréquente à la moins fréquente
  const categories = Object.entries(stats.repartition || {}).sort(
    (a, b) => b[1] - a[1]
  );
  const categorieDominante =
    categories.length > 0 &&
    (categories.length === 1 || categories[0][1] > categories[1][1])
      ? categories[0][0]
      : null;

  // Prochain rendez-vous à venir (ni annulé, ni terminé)
  const maintenant = new Date();
  const prochainRdv = rdvs
    .filter((r) => r.statut !== "annule" && r.statut !== "termine")
    .map((r) => ({
      ...r,
      quand: new Date(`${r.date}T${String(r.heure || "00:00").slice(0, 5)}:00`),
    }))
    .filter((r) => !Number.isNaN(r.quand.getTime()) && r.quand >= maintenant)
    .sort((a, b) => a.quand - b.quand)[0];
  const datesProchain = prochainRdv ? decouperDate(prochainRdv.date) : null;

  const nbInvitations = invitations.length;
  const sousTitreHero =
    nbInvitations === 0
      ? "Aucune invitation en attente : vous êtes à jour."
      : nbInvitations === 1
      ? "1 invitation de patient attend votre réponse."
      : `${nbInvitations} invitations de patients attendent votre réponse.`;

  // Répartition des rendez-vous par statut (pour l'anneau)
  const segmentsRdv = STATUTS_RDV.map((st) => ({
    ...st,
    total: rdvs.filter((r) => r.statut === st.cle).length,
  })).filter((st) => st.total > 0);

  return (
    <>
      <header className="medecin-topbar">
        <div>
          <h1>Bonjour, Dr. {user.nom || "Médecin"} 👋</h1>
          <p>Voici un aperçu de votre activité aujourd'hui.</p>
        </div>

        <img
          src={user.photo || "https://i.pravatar.cc/150?img=68"}
          alt="profil"
          className="medecin-avatar"
        />
      </header>

      {user.statutValidation !== "valide" ? (
        <div className="pending-banner">
          ⏳ Votre compte est en attente de validation par un administrateur.
          Certaines fonctionnalités seront limitées jusqu'à validation.
        </div>
      ) : (
        isLoading ? (
          <div className="dashboard-loading">Chargement...</div>
        ) : (
          <section className="medecin-grid">
            <div className="hero-medecin">
              <div className="hero-texte">
                <h2 className="hero-titre">
                  {rdvsAujourdhui.length === 0
                    ? "Aucun rendez-vous aujourd'hui"
                    : `${rdvsAujourdhui.length} rendez-vous aujourd'hui`}
                </h2>
                <p className="hero-sous-titre">{sousTitreHero}</p>
                <button
                  type="button"
                  className="hero-bouton"
                  onClick={() => navigate("/medecin/rdv")}
                >
                  Voir mes rendez-vous
                </button>
              </div>

              <div className="hero-prochain">
                <span className="hero-prochain-label">Prochain rendez-vous</span>
                {prochainRdv ? (
                  <>
                    <strong>
                      {datesProchain.jour} {datesProchain.moisAnnee} ·{" "}
                      {prochainRdv.heure}
                    </strong>
                    <span>{prochainRdv.patient?.nom || "Patient"}</span>
                  </>
                ) : (
                  <span className="hero-prochain-vide">
                    Aucun rendez-vous à venir
                  </span>
                )}
              </div>
            </div>

            <div className="medecin-card big-card">
              <h3>📅 Prochains rendez-vous</h3>

              {rdvs.length === 0 ? (
                <p className="empty-state">Aucun rendez-vous pour le moment.</p>
              ) : (
                rdvs.slice(0, 5).map((r) => {
                  const { jour, moisAnnee } = decouperDate(r.date);
                  return (
                    <div className="rdv-dashboard-item" key={r._id}>
                      <div className="rdv-date-box">
                        <strong className="rdv-jour">{jour}</strong>
                        <span className="rdv-mois">{moisAnnee}</span>
                        <span className="rdv-heure">{r.heure}</span>
                      </div>

                      <div className="rdv-info-box">
                        <h4>{r.patient?.nom || "Patient"}</h4>
                        <p>{r.motif || "Consultation médicale"}</p>
                      </div>

                      <span className={`rdv-status ${r.statut}`}>
                        {libelleStatut(r.statut)}
                      </span>
                    </div>
                  );
                })
              )}

              <button onClick={() => navigate("/medecin/rdv")}>
                Voir tous les rendez-vous
              </button>
            </div>

            <div className="medecin-card">
              <div className="card-title-row">
                <h3>📨 Invitations récentes</h3>
                <button onClick={() => navigate("/medecin/invitations")}>
                  Voir toutes
                </button>
              </div>

              {invitations.length === 0 ? (
                <p className="empty-state">
                  Aucune invitation en attente.
                </p>
              ) : (
                invitations.slice(0, 3).map((inv) => (
                  <div className="invitation-mini-item" key={inv._id}>
                    <img
                      src={
                        inv.patient?.photo ||
                        "https://i.pravatar.cc/80?img=32"
                      }
                      alt="patient"
                    />
                    <div>
                      <strong>{inv.patient?.nom}</strong>
                      <p>Demande de suivi médical</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="medecin-card">
              <div className="card-title-row">
                <h3>📊 Répartition des diagnostics</h3>
                {stats.total > 0 && (
                  <span className="stats-total">
                    {stats.total} diagnostic{stats.total > 1 ? "s" : ""}
                  </span>
                )}
              </div>

              {stats.total === 0 ? (
                <p className="empty-state">
                  Aucun diagnostic posé pour le moment.
                </p>
              ) : (
                <>
                  <ul className="stats-bars">
                    {categories.map(([categorie, count], i) => {
                      const pourcentage = Math.round(
                        (count / stats.total) * 100
                      );
                      return (
                        <li
                          className="stats-bar-row"
                          key={categorie}
                          style={{
                            "--stats-couleur":
                              COULEURS_STATS[i % COULEURS_STATS.length],
                          }}
                        >
                          <div className="stats-bar-label">
                            <span className="stats-bar-nom">
                              <span
                                className="stats-bar-pastille"
                                aria-hidden="true"
                              />
                              {categorie}
                            </span>
                            <span className="stats-bar-valeurs">
                              <strong>{count}</strong>
                              <span className="stats-bar-pct">
                                {pourcentage} %
                              </span>
                            </span>
                          </div>
                          <div className="stats-bar-track" aria-hidden="true">
                            <div
                              className="stats-bar-fill"
                              style={{ width: `${pourcentage}%` }}
                            ></div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>

                  {categorieDominante && (
                    <p className="stats-resume">
                      Catégorie la plus fréquente :{" "}
                      <strong>{categorieDominante}</strong>
                    </p>
                  )}
                </>
              )}
            </div>

            <div className="medecin-card">
              <h3>🗂️ Activité des rendez-vous</h3>
              {segmentsRdv.length === 0 ? (
                <p className="empty-state">Aucun rendez-vous pour le moment.</p>
              ) : (
                <DonutRdv segments={segmentsRdv} />
              )}
            </div>

            <div className="medecin-card acces-card">
              <h3>⚡ Accès rapide</h3>
              <div className="acces-grille">
                {ACCES_RAPIDES.map((a) => (
                  <Link key={a.to} to={a.to} className="acces-tuile">
                    <span className="acces-icone" aria-hidden="true">
                      {a.icone}
                    </span>
                    <span className="acces-titre">
                      {a.titre}
                      {a.to === "/medecin/invitations" && nbInvitations > 0 && (
                        <span className="acces-badge">{nbInvitations}</span>
                      )}
                    </span>
                    <span className="acces-texte">{a.texte}</span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )
      )}
    </>
  );
}

export default DashboardMedecin;