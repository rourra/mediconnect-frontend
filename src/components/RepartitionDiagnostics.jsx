import "./RepartitionDiagnostics.css";

// Une couleur par catégorie (dans l'ordre d'affichage, puis le cycle recommence).
const PALETTE = [
  "#4f46e5",
  "#06b6d4",
  "#10b981",
  "#f59e0b",
  "#f43f5e",
  "#8b5cf6",
  "#0ea5e9",
  "#f97316",
];

// Noms de champs acceptés pour ne pas dépendre de la forme exacte des données
// renvoyées par ton backend.
const CLES_NOM = ["categorie", "category", "label", "nom", "name", "diagnostic", "_id"];
const CLES_VALEUR = ["total", "count", "nombre", "nb", "valeur", "value"];

// Accepte :
//   [{ categorie: "Respiratoire", total: 2 }, ...]   (ou count / nombre / value...)
//   { Respiratoire: 2, Cardiovasculaire: 1 }
function normaliser(donnees) {
  if (!donnees) return [];

  let brut = [];

  if (Array.isArray(donnees)) {
    brut = donnees.map((d) => {
      const cleNom = CLES_NOM.find((k) => d && d[k] != null);
      const cleValeur = CLES_VALEUR.find((k) => d && d[k] != null);
      return {
        nom: cleNom ? String(d[cleNom]) : "Autre",
        total: Number(cleValeur ? d[cleValeur] : 0),
      };
    });
  } else if (typeof donnees === "object") {
    brut = Object.entries(donnees).map(([nom, total]) => ({
      nom,
      total: Number(total),
    }));
  }

  return brut
    .filter((l) => l.nom && Number.isFinite(l.total) && l.total > 0)
    .sort((a, b) => b.total - a.total);
}

// Utilisation dans DashboardMedecin :
//   <RepartitionDiagnostics donnees={ta_variable_de_repartition} />
// Le composant dessine TOUTE la carte : remplace le bloc complet de l'ancienne
// carte « Répartition des diagnostics », pas seulement son contenu.
export default function RepartitionDiagnostics({
  donnees,
  titre = "Répartition des diagnostics",
}) {
  const lignes = normaliser(donnees);
  const total = lignes.reduce((somme, l) => somme + l.total, 0);
  const premiere = lignes[0];
  const dominanteUnique =
    premiere && (lignes.length === 1 || premiere.total > lignes[1].total);

  return (
    <section className="rd-carte" aria-labelledby="rd-titre">
      <div className="rd-tete">
        <h3 id="rd-titre" className="rd-titre">
          📊 {titre}
        </h3>
        {total > 0 && (
          <span className="rd-total">
            {total} diagnostic{total > 1 ? "s" : ""}
          </span>
        )}
      </div>

      {total === 0 ? (
        <p className="rd-vide">
          Aucun diagnostic enregistré pour le moment. Les statistiques
          apparaîtront dès que vous ajouterez des diagnostics dans les dossiers
          de vos patients.
        </p>
      ) : (
        <>
          <ul className="rd-liste">
            {lignes.map((l, i) => {
              const pct = Math.round((l.total / total) * 100);
              return (
                <li
                  key={`${l.nom}-${i}`}
                  className="rd-ligne"
                  style={{ "--rd-couleur": PALETTE[i % PALETTE.length] }}
                >
                  <div className="rd-infos">
                    <span className="rd-nom">
                      <span className="rd-pastille" aria-hidden="true" />
                      {l.nom}
                    </span>
                    <span className="rd-valeurs">
                      <strong>{l.total}</strong>
                      <span className="rd-pct">{pct} %</span>
                    </span>
                  </div>
                  <div className="rd-piste" aria-hidden="true">
                    <div className="rd-barre" style={{ width: `${pct}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>

          {dominanteUnique && (
            <p className="rd-resume">
              Catégorie la plus fréquente : <strong>{premiere.nom}</strong>
            </p>
          )}
        </>
      )}
    </section>
  );
}