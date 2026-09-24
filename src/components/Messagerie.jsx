import { useEffect, useRef, useState } from "react";
import api from "../services/api";
import "./Messagerie.css";

// Intervalle de rafraîchissement (version simple, pas de temps réel WebSocket)
const INTERVALLE_RAFRAICHISSEMENT = 4000;

function Messagerie() {
  const user = JSON.parse(localStorage.getItem("user")) || {};

  const [contacts, setContacts] = useState([]);
  const [recherche, setRecherche] = useState("");
  const [contactActif, setContactActif] = useState(null);
  const [messages, setMessages] = useState([]);
  const [texte, setTexte] = useState("");
  const [isLoadingContacts, setIsLoadingContacts] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const finDesMessagesRef = useRef(null);
  const contactActifRef = useRef(null);

  useEffect(() => {
    contactActifRef.current = contactActif;
  }, [contactActif]);

  const chargerContacts = async () => {
    try {
      const res = await api.get("/messages/contacts");
      setContacts(res.data);
    } catch (error) {
      console.error("Erreur chargement contacts :", error);
    } finally {
      setIsLoadingContacts(false);
    }
  };

  const chargerConversation = async (contactId) => {
    try {
      const res = await api.get(`/messages/${contactId}`);
      setMessages(res.data);
    } catch (error) {
      console.error("Erreur chargement conversation :", error);
    }
  };

  useEffect(() => {
    chargerContacts();
  }, []);

  // Rafraîchissement automatique : contacts (pour badges) + conversation ouverte
  useEffect(() => {
    const interval = setInterval(() => {
      chargerContacts();
      if (contactActifRef.current) {
        chargerConversation(contactActifRef.current._id);
      }
    }, INTERVALLE_RAFRAICHISSEMENT);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    finDesMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const ouvrirConversation = (contact) => {
    setContactActif(contact);
    chargerConversation(contact._id);
  };

  const envoyer = async (e) => {
    e.preventDefault();
    if (!texte.trim() || !contactActif) return;

    setIsSending(true);
    try {
      await api.post("/messages", {
        destinataireId: contactActif._id,
        contenu: texte.trim(),
      });
      setTexte("");
      await chargerConversation(contactActif._id);
    } catch (error) {
      alert(error.response?.data?.message || "Erreur lors de l'envoi");
    } finally {
      setIsSending(false);
    }
  };

  const contactsFiltres = contacts.filter((c) =>
    c.nom?.toLowerCase().includes(recherche.toLowerCase())
  );

  return (
    <div className="msg-page">
      <aside className="msg-contacts">
        <h2>Conversations</h2>

        {contacts.length > 0 && (
          <input
            type="text"
            className="msg-search"
            placeholder="🔍 Rechercher..."
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
          />
        )}

        {isLoadingContacts ? (
          <p className="msg-empty">Chargement...</p>
        ) : contacts.length === 0 ? (
          <p className="msg-empty">
            {user.role === "patient"
              ? "Aucun médecin autorisé pour l'instant. Envoyez une invitation depuis 'Mes médecins'."
              : "Aucun patient autorisé pour l'instant."}
          </p>
        ) : contactsFiltres.length === 0 ? (
          <p className="msg-empty">Aucun résultat pour "{recherche}".</p>
        ) : (
          contactsFiltres.map((c) => (
            <div
              key={c._id}
              className={`msg-contact-item ${
                contactActif?._id === c._id ? "active" : ""
              }`}
              onClick={() => ouvrirConversation(c)}
            >
              <img src={c.photo || "https://i.pravatar.cc/80?img=20"} alt={c.nom} />
              <div>
                <strong>
                  {user.role === "patient" ? `Dr. ${c.nom}` : c.nom}
                </strong>
                <p>{c.specialite || c.email}</p>
              </div>
            </div>
          ))
        )}
      </aside>

      <main className="msg-conversation">
        {!contactActif ? (
          <div className="msg-placeholder">
            💬 Sélectionnez une conversation pour commencer.
          </div>
        ) : (
          <>
            <header className="msg-conv-header">
              <img
                src={contactActif.photo || "https://i.pravatar.cc/80?img=20"}
                alt={contactActif.nom}
              />
              <strong>
                {user.role === "patient"
                  ? `Dr. ${contactActif.nom}`
                  : contactActif.nom}
              </strong>
            </header>

            <div className="msg-list">
              {messages.length === 0 ? (
                <p className="msg-empty">
                  Aucun message. Commencez la conversation !
                </p>
              ) : (
                messages.map((m) => (
                  <div
                    key={m._id}
                    className={`msg-bubble ${
                      m.expediteur === user.id ? "mine" : "theirs"
                    }`}
                  >
                    <p>{m.contenu}</p>
                    <span>
                      {new Date(m.createdAt).toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                ))
              )}
              <div ref={finDesMessagesRef} />
            </div>

            <form className="msg-input-row" onSubmit={envoyer}>
              <input
                type="text"
                placeholder="Écrivez votre message..."
                value={texte}
                onChange={(e) => setTexte(e.target.value)}
              />
              <button type="submit" disabled={isSending || !texte.trim()}>
                Envoyer
              </button>
            </form>
          </>
        )}
      </main>
    </div>
  );
}

export default Messagerie;