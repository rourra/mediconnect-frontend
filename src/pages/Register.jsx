import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../assets/mediconnect-logo.png";
import "./Register.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function Register() {
  const navigate = useNavigate();

  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [dateNaissance, setDateNaissance] = useState("");
  const [telephone, setTelephone] = useState("");
  const [adresse, setAdresse] = useState("");
  const [photo, setPhoto] = useState("");
  const [role, setRole] = useState("patient");
  const [specialite, setSpecialite] = useState("");
  const [numeroOrdre, setNumeroOrdre] = useState("");
  const [justificatif, setJustificatif] = useState(null);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const getMaxDate18 = () => {
    const today = new Date();
    today.setFullYear(today.getFullYear() - 18);
    return today.toISOString().split("T")[0];
  };

  const calculerAge = (date) => {
    const birth = new Date(date);
    const today = new Date();

    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }

    return age;
  };

  const handlePhoto = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrors({ photo: "Veuillez choisir une image valide." });
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      setPhoto(reader.result);
    };

    reader.readAsDataURL(file);
  };

  const handleJustificatif = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const typesAutorises = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!typesAutorises.includes(file.type)) {
      setErrors({ justificatif: "Formats acceptés : PDF, JPEG, PNG, WEBP." });
      return;
    }

    setJustificatif(file);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!nom.trim()) {
      newErrors.nom = "Le nom complet est obligatoire.";
    }

    if (!email.trim()) {
      newErrors.email = "L’adresse email est obligatoire.";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Veuillez saisir une adresse email valide.";
    }

    if (!motDePasse) {
      newErrors.motDePasse = "Le mot de passe est obligatoire.";
    } else if (motDePasse.length < 6) {
      newErrors.motDePasse =
        "Le mot de passe doit contenir au moins 6 caractères.";
    }

    if (!dateNaissance) {
      newErrors.dateNaissance = "La date de naissance est obligatoire.";
    } else if (calculerAge(dateNaissance) < 18) {
      newErrors.dateNaissance = "Vous devez avoir au minimum 18 ans.";
    }

    if (!telephone.trim()) {
      newErrors.telephone = "Le numéro de téléphone est obligatoire.";
    } else if (!/^[0-9+\s]{8,15}$/.test(telephone)) {
      newErrors.telephone = "Veuillez saisir un numéro valide.";
    }

    if (!adresse.trim()) {
      newErrors.adresse = "L’adresse est obligatoire.";
    }

    if (role === "patient" && !photo) {
      newErrors.photo = "La photo de profil est obligatoire.";
    }

    if (role === "medecin") {
      if (!specialite) {
        newErrors.specialite = "Veuillez sélectionner votre spécialité médicale.";
      }
      if (!numeroOrdre.trim()) {
        newErrors.numeroOrdre = "Le numéro d'ordre est obligatoire.";
      }
      if (!justificatif) {
        newErrors.justificatif =
          "Un justificatif (diplôme ou carte professionnelle) est obligatoire.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);
      setErrors({});

      const formData = new FormData();
      formData.append("nom", nom);
      formData.append("email", email);
      formData.append("motDePasse", motDePasse);
      formData.append("dateNaissance", dateNaissance);
      formData.append("telephone", telephone);
      formData.append("adresse", adresse);
      formData.append("photo", photo);
      formData.append("role", role);
      formData.append("specialite", specialite);

      if (role === "medecin") {
        formData.append("numeroOrdre", numeroOrdre);
        formData.append("justificatif", justificatif);
      }

      await axios.post(`${API_URL}/api/auth/register`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Compte créé avec succès");
      navigate("/login");
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        "Erreur lors de la création du compte.";

      if (msg.includes("email") || msg.includes("existe")) {
        setErrors({ email: "Cet email est déjà utilisé." });
      } else if (msg.includes("request entity too large")) {
        setErrors({
          general:
            "La photo est trop grande. Veuillez choisir une image plus petite.",
        });
      } else {
        setErrors({ general: msg });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">
        <img className="register-logo" src={logo} alt="MediConnect" />

        <h1>Créer un compte</h1>

        <p className="register-subtitle">
          Rejoignez MediConnect et accédez à votre espace médical.
        </p>

        {errors.general && (
          <div className="register-error">{errors.general}</div>
        )}

        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label>Nom complet</label>
            <input
              type="text"
              placeholder="Votre nom complet"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
            />
            {errors.nom && <small>{errors.nom}</small>}
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="exemple@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && <small>{errors.email}</small>}
          </div>

          <div className="form-group">
            <label>Mot de passe</label>

            <div className="password-box">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Entrer le mot de passe (minimum 6 caractères)"
                value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)}
              />

              <button
                type="button"
                className="password-eye"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>

            {errors.motDePasse && <small>{errors.motDePasse}</small>}
          </div>

          <div className="form-group">
            <label>Date de naissance</label>

            <input
              type="date"
              value={dateNaissance}
              max={getMaxDate18()}
              onChange={(e) => setDateNaissance(e.target.value)}
            />

            {dateNaissance && (
              <p className="age-info">Âge : {calculerAge(dateNaissance)} ans</p>
            )}

            {errors.dateNaissance && <small>{errors.dateNaissance}</small>}
          </div>

          <div className="form-group">
            <label>Téléphone</label>
            <input
              type="text"
              placeholder="+216 XX XXX XXX"
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
            />
            {errors.telephone && <small>{errors.telephone}</small>}
          </div>

          <div className="form-group">
            <label>Adresse</label>
            <input
              type="text"
              placeholder="Votre adresse complète"
              value={adresse}
              onChange={(e) => setAdresse(e.target.value)}
            />
            {errors.adresse && <small>{errors.adresse}</small>}
          </div>

          <div className="form-group">
            <label>Photo de profil</label>

            <label className="upload-box">
              <span>📷 Choisir une photo</span>
              <input type="file" accept="image/*" onChange={handlePhoto} />
            </label>

            {photo && (
              <img className="preview-photo" src={photo} alt="preview" />
            )}

            {errors.photo && <small>{errors.photo}</small>}
          </div>

          <div className="form-group">
            <label>Type de compte</label>

            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="patient">Patient</option>
              <option value="medecin">Médecin</option>
            </select>
          </div>

          {role === "medecin" && (
            <>
              <div className="form-group">
                <label>Spécialité médicale</label>

                <select
                  value={specialite}
                  onChange={(e) => setSpecialite(e.target.value)}
                >
                  <option value="">Choisir une spécialité</option>
                  <option value="Cardiologue">Cardiologue</option>
                  <option value="Dermatologue">Dermatologue</option>
                  <option value="Endocrinologue">Endocrinologue</option>
                  <option value="Gynécologue">Gynécologue</option>
                  <option value="Neurologue">Neurologue</option>
                  <option value="Ophtalmologue">Ophtalmologue</option>
                  <option value="ORL">ORL</option>
                  <option value="Pédiatre">Pédiatre</option>
                  <option value="Psychiatre">Psychiatre</option>
                  <option value="Radiologue">Radiologue</option>
                  <option value="Rhumatologue">Rhumatologue</option>
                  <option value="Urologue">Urologue</option>
                  <option value="Médecin Généraliste">
                    Médecin Généraliste
                  </option>
                </select>

                {errors.specialite && <small>{errors.specialite}</small>}
              </div>

              <div className="form-group">
                <label>Numéro d'ordre des médecins</label>
                <input
                  type="text"
                  placeholder="Ex: 12345"
                  value={numeroOrdre}
                  onChange={(e) => setNumeroOrdre(e.target.value)}
                />
                {errors.numeroOrdre && <small>{errors.numeroOrdre}</small>}
              </div>

              <div className="form-group">
                <label>Justificatif (diplôme ou carte professionnelle)</label>

                <label className="upload-box">
                  <span>
                    📄 {justificatif ? justificatif.name : "Choisir un fichier"}
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    onChange={handleJustificatif}
                  />
                </label>

                <small className="upload-hint">
                  Formats acceptés : PDF, JPEG, PNG, WEBP — ce document sera
                  examiné par un administrateur avant validation de votre compte.
                </small>

                {errors.justificatif && <small>{errors.justificatif}</small>}
              </div>
            </>
          )}

          <button className="register-btn" type="submit" disabled={loading}>
            {loading ? "Création..." : "Créer mon compte"}
          </button>
        </form>

        <p className="login-link">
          Vous avez déjà un compte ?{" "}
          <span onClick={() => navigate("/login")}>Se connecter</span>
        </p>
      </div>
    </div>
  );
}

export default Register;