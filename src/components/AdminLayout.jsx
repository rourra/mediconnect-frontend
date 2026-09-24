import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import "./AdminLayout.css";

const lireUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user")) || {};
  } catch {
    return {};
  }
};

function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(lireUser);

  // Met à jour le nom et la photo du menu dès que la page Paramètres
  // les modifie (sans avoir besoin de recharger la page).
  useEffect(() => {
    const rafraichir = () => setUser(lireUser());
    window.addEventListener("user-updated", rafraichir);
    return () => window.removeEventListener("user-updated", rafraichir);
  }, []);

  const estActif = (chemin) => location.pathname === chemin;

  const deconnexion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="admin-page">
      <aside className="admin-sidebar">
        <div className="brand">🛡️ MediConnect Admin</div>

        <nav>
          <a
            className={estActif("/admin") ? "active" : ""}
            onClick={() => navigate("/admin")}
          >
            🏠 Tableau de bord
          </a>

          <a
            className={estActif("/admin/utilisateurs") ? "active" : ""}
            onClick={() => navigate("/admin/utilisateurs")}
          >
            👥 Utilisateurs
          </a>

          <a
            className={estActif("/admin/parametres") ? "active" : ""}
            onClick={() => navigate("/admin/parametres")}
          >
            ⚙️ Paramètres
          </a>
        </nav>

        <div className="admin-user-card">
          <img
            src={user.photo || "https://i.pravatar.cc/80?img=5"}
            alt="admin"
          />
          <div>
            <strong>{user.nom || "Admin"}</strong>
            <p>Administrateur</p>
          </div>
        </div>

        <button className="logout-btn" onClick={deconnexion}>
          🚪 Déconnexion
        </button>
      </aside>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;