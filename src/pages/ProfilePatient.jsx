import { useNavigate } from "react-router-dom";
import "./ProfilePatient.css";

function ProfilePatient() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user")) || {};

  return (
    <div className="profile-page">
      <div className="profile-card">
        <button className="back-btn" onClick={() => navigate("/patient")}>
          ← Retour
        </button>

        <div className="profile-header">
          <img
            src={user.photo || "https://i.pravatar.cc/120?img=47"}
            alt="profil"
          />

          <div>
            <h1>{user.nom || "Patient"}</h1>
            <p>Profil patient MediConnect</p>
          </div>
        </div>

        <div className="profile-info">
          <div>
            <span>Nom complet</span>
            <strong>{user.nom || "Non renseigné"}</strong>
          </div>

          <div>
            <span>Email</span>
            <strong>{user.email || "Non renseigné"}</strong>
          </div>

          <div>
            <span>Date de naissance</span>
            <strong>{user.dateNaissance || "Non renseignée"}</strong>
          </div>

          <div>
            <span>Rôle</span>
            <strong>{user.role || "patient"}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePatient;