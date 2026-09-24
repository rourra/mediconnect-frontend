import { Link } from "react-router-dom";
import logo from "../assets/mediconnect-logo.png";
function Navbar() {
  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <div className="navbar">
   <div className="logo">
  <img src={logo} alt="MediConnect" className="navbar-logo-img" />
</div>

      <div className="nav-links">
        <Link to="/about">
          <button>À propos</button>
        </Link>

        <Link to="/patient">
          <button>Espace Patient</button>
        </Link>

        <Link to="/medecin">
          <button>Espace Médecin</button>
        </Link>

        <button onClick={logout}>Déconnexion</button>
      </div>
    </div>
  );
}

export default Navbar;