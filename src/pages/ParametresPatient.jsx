import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./ParametresPatient.css";

function ParametresPatient() {
  const navigate = useNavigate();
  const userStocke = JSON.parse(localStorage.getItem("user")) || {};

  const [form, setForm] = useState({
    nom: userStocke.nom || "",
    email: userStocke.email || "",
    telephone: userStocke.telephone || "",
    adresse: userStocke.adresse || "",
    dateNaissance: userStocke.dateNaissance || "",
  });

  const [motDePasseForm, setMotDePasseForm] = useState({
    ancienMotDePasse: "",
    nouveauMotDePasse: "",
    confirmation: "",
  });

  const [photo, setPhoto] = useState(userStocke.photo || "");
  const [fichierPhoto, setFichierPhoto] = useState(null);

  const [messageProfil, setMessageProfil] = useState("");
  const [messageMotDePasse, setMessageMotDePasse] = useState("");
  const [erreurProfil, setErreurProfil] = useState("");
  const [erreurMotDePasse, setErreurMotDePasse] = useState("");
  const [isSavingProfil, setIsSavingProfil] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const [motDePasseSuppression, setMotDePasseSuppression] = useState("");
  const [erreurSuppression, setErreurSuppression] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const mettreAJourStorage = (user) => {
    localStorage.setItem("user", JSON.stringify(user));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFichierPhoto(file);
    setPhoto(URL.createObjectURL(file));
  };

  const enregistrerPhoto = async () => {
    if (!fichierPhoto) return;

    const formData = new FormData();
    formData.append("photo", fichierPhoto);

    try {
      const res = await api.post("/auth/profile/photo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      mettreAJourStorage(res.data.user);
      setPhoto(res.data.user.photo);
      setFichierPhoto(null);
    } catch (error) {
      setErreurProfil(
        error.response?.data?.message || "Erreur lors de l'envoi de la photo"
      );
    }
  };

  const handleProfilSubmit = async (e) => {
    e.preventDefault();
    setErreurProfil("");
    setMessageProfil("");
    setIsSavingProfil(true);

    try {
      if (fichierPhoto) {
        await enregistrerPhoto();
      }

      const res = await api.put("/auth/profile", form);
      mettreAJourStorage(res.data.user);
      setMessageProfil("Profil mis à jour avec succès.");
    } catch (error) {
      setErreurProfil(
        error.response?.data?.message || "Erreur lors de la mise à jour"
      );
    } finally {
      setIsSavingProfil(false);
    }
  };

  const handleMotDePasseSubmit = async (e) => {
    e.preventDefault();
    setErreurMotDePasse("");
    setMessageMotDePasse("");

    if (motDePasseForm.nouveauMotDePasse !== motDePasseForm.confirmation) {
      setErreurMotDePasse("Les mots de passe ne correspondent pas");
      return;
    }

    setIsSavingPassword(true);

    try {
      await api.put("/auth/profile", {
        ancienMotDePasse: motDePasseForm.ancienMotDePasse,
        nouveauMotDePasse: motDePasseForm.nouveauMotDePasse,
      });
      setMessageMotDePasse("Mot de passe modifié avec succès.");
      setMotDePasseForm({
        ancienMotDePasse: "",
        nouveauMotDePasse: "",
        confirmation: "",
      });
    } catch (error) {
      setErreurMotDePasse(
        error.response?.data?.message || "Erreur lors du changement"
      );
    } finally {
      setIsSavingPassword(false);
    }
  };

  const supprimerCompte = async (e) => {
    e.preventDefault();
    setErreurSuppression("");

    if (
      !window.confirm(
        "Voulez-vous vraiment désactiver votre compte ? Cette action est irréversible depuis votre espace."
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      await api.delete("/users/mon-compte", {
        data: { motDePasse: motDePasseSuppression },
      });
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("user");
      navigate("/login");
    } catch (error) {
      setErreurSuppression(
        error.response?.data?.message || "Erreur lors de la suppression"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="parampat-page">
      <header className="parampat-header">
        <h1>⚙️ Paramètres du compte</h1>
        <p>Gérez vos informations personnelles et votre sécurité.</p>
      </header>

      <div className="parampat-grid">
        {/* ================= INFOS PERSONNELLES ================= */}
        <form className="parampat-card" onSubmit={handleProfilSubmit}>
          <h3>Informations personnelles</h3>

          <div className="parampat-photo-row">
            <img src={photo || "https://i.pravatar.cc/100?img=47"} alt="profil" />
            <label className="parampat-upload-btn">
              Changer la photo
              <input type="file" accept="image/*" onChange={handlePhotoChange} hidden />
            </label>
          </div>

          {messageProfil && <div className="parampat-success">{messageProfil}</div>}
          {erreurProfil && <div className="parampat-error">{erreurProfil}</div>}

          <label>Nom complet</label>
          <input
            type="text"
            value={form.nom}
            onChange={(e) => setForm({ ...form, nom: e.target.value })}
            required
          />

          <label>Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />

          <label>Date de naissance</label>
          <input
            type="date"
            value={form.dateNaissance}
            onChange={(e) => setForm({ ...form, dateNaissance: e.target.value })}
          />

          <label>Téléphone</label>
          <input
            type="tel"
            value={form.telephone}
            onChange={(e) => setForm({ ...form, telephone: e.target.value })}
          />

          <label>Adresse</label>
          <input
            type="text"
            value={form.adresse}
            onChange={(e) => setForm({ ...form, adresse: e.target.value })}
          />

          <button type="submit" disabled={isSavingProfil}>
            {isSavingProfil ? "Enregistrement..." : "Enregistrer les modifications"}
          </button>
        </form>

        {/* ================= MOT DE PASSE ================= */}
        <form className="parampat-card" onSubmit={handleMotDePasseSubmit}>
          <h3>Sécurité</h3>

          {messageMotDePasse && (
            <div className="parampat-success">{messageMotDePasse}</div>
          )}
          {erreurMotDePasse && (
            <div className="parampat-error">{erreurMotDePasse}</div>
          )}

          <label>Mot de passe actuel</label>
          <div className="parampat-password-row">
            <input
              type={showPassword ? "text" : "password"}
              value={motDePasseForm.ancienMotDePasse}
              onChange={(e) =>
                setMotDePasseForm({
                  ...motDePasseForm,
                  ancienMotDePasse: e.target.value,
                })
              }
              required
            />
            <button
              type="button"
              className="parampat-eye-btn"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>

          <label>Nouveau mot de passe</label>
          <div className="parampat-password-row">
            <input
              type={showPassword ? "text" : "password"}
              value={motDePasseForm.nouveauMotDePasse}
              onChange={(e) =>
                setMotDePasseForm({
                  ...motDePasseForm,
                  nouveauMotDePasse: e.target.value,
                })
              }
              minLength={6}
              required
            />
            <button
              type="button"
              className="parampat-eye-btn"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>

          <label>Confirmer le nouveau mot de passe</label>
          <div className="parampat-password-row">
            <input
              type={showPassword ? "text" : "password"}
              value={motDePasseForm.confirmation}
              onChange={(e) =>
                setMotDePasseForm({
                  ...motDePasseForm,
                  confirmation: e.target.value,
                })
              }
              minLength={6}
              required
            />
            <button
              type="button"
              className="parampat-eye-btn"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>

          <button type="submit" disabled={isSavingPassword}>
            {isSavingPassword ? "Enregistrement..." : "Changer le mot de passe"}
          </button>
        </form>

        {/* ================= ZONE DANGEREUSE ================= */}
        <form className="parampat-card parampat-danger" onSubmit={supprimerCompte}>
          <h3>⚠️ Zone dangereuse</h3>
          <p className="parampat-danger-text">
            La suppression de votre compte le désactivera immédiatement. Votre
            dossier médical est conservé pour la continuité des soins, mais
            vous ne pourrez plus vous connecter.
          </p>

          {erreurSuppression && (
            <div className="parampat-error">{erreurSuppression}</div>
          )}

          <label>Confirmez avec votre mot de passe</label>
          <input
            type="password"
            value={motDePasseSuppression}
            onChange={(e) => setMotDePasseSuppression(e.target.value)}
            required
          />

          <button
            type="submit"
            className="parampat-danger-btn"
            disabled={isDeleting}
          >
            {isDeleting ? "Suppression..." : "Supprimer mon compte"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ParametresPatient;