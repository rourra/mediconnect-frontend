import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import "./App.css";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import PatientLayout from "./components/PatientLayout";
import MedecinLayout from "./components/MedecinLayout";
import AdminLayout from "./components/AdminLayout";

import Home from "./pages/Home";
import About from "./pages/About";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import DashboardPatient from "./pages/DashboardPatient";
import RendezVousPatient from "./pages/RendezVousPatient";
import MedecinsPatient from "./pages/MedecinsPatient";
import MessageriePatient from "./pages/MessageriePatient";
import DossierPatient from "./pages/DossierPatient";
import AvisPatient from "./pages/AvisPatient";
import AssistantIA from "./pages/AssistantIA";
import ParametresPatient from "./pages/ParametresPatient";
import InvitationsMedecin from "./pages/InvitationsMedecin";
import DashboardMedecin from "./pages/DashboardMedecin";
import RendezVousMedecin from "./pages/RendezVousMedecin";
import ParametresMedecin from "./pages/ParametresMedecin";
import MessagerieMedecin from "./pages/MessagerieMedecin";
import MesPatients from "./pages/MesPatients";
import DossierPatientMedecin from "./pages/DossierPatientMedecin";
import DisponibilitesMedecin from "./pages/DisponibilitesMedecin";
import DashboardAdmin from "./pages/DashboardAdmin";
import ParametresAdmin from "./pages/ParametresAdmin";
import UtilisateursAdmin from "./pages/UtilisateursAdmin";

function AppContent() {
  const location = useLocation();

  const hideNavbar =
    location.pathname === "/" ||
    location.pathname === "/login" ||
    location.pathname === "/register" ||
    location.pathname === "/forgot-password" ||
    location.pathname.startsWith("/reset-password") ||
    location.pathname.startsWith("/patient") ||
    location.pathname.startsWith("/medecin") ||
    location.pathname.startsWith("/admin");

  return (
    <>
      {!hideNavbar && <Navbar />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* ================= ESPACE PATIENT ================= */}
        <Route
          path="/patient"
          element={
            <ProtectedRoute allowedRoles={["patient"]}>
              <PatientLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPatient />} />
          <Route path="rdv" element={<RendezVousPatient />} />
          <Route path="medecins" element={<MedecinsPatient />} />
          <Route path="messages" element={<MessageriePatient />} />
          <Route path="dossier" element={<DossierPatient />} />
          <Route path="avis" element={<AvisPatient />} />
          <Route path="assistant" element={<AssistantIA />} />
          <Route path="settings" element={<ParametresPatient />} />
        </Route>

        {/* ================= ESPACE MEDECIN ================= */}
        <Route
          path="/medecin"
          element={
            <ProtectedRoute allowedRoles={["medecin"]}>
              <MedecinLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardMedecin />} />
          <Route path="rdv" element={<RendezVousMedecin />} />
          <Route path="invitations" element={<InvitationsMedecin />} />
          <Route path="parametres" element={<ParametresMedecin />} />
          <Route path="messages" element={<MessagerieMedecin />} />
          <Route path="patients" element={<MesPatients />} />
          <Route path="patients/:patientId" element={<DossierPatientMedecin />} />
          <Route path="disponibilites" element={<DisponibilitesMedecin />} />
        </Route>

        {/* ================= ESPACE ADMIN ================= */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardAdmin />} />
          <Route path="utilisateurs" element={<UtilisateursAdmin />} />
          <Route path="parametres" element={<ParametresAdmin />} />
        </Route>

        {/* ================= 404 ================= */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;