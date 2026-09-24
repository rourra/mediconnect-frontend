import { useEffect, useRef, useState } from "react";
import api from "../services/api";
import "./AssistantIA.css";

function AssistantIA() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      contenu:
        "Bonjour 👋 Je suis l'assistant MediConnect. Je peux vous aider à naviguer dans la plateforme ou répondre à des questions générales de santé. Je ne remplace pas un médecin — pour tout problème précis, prenez rendez-vous avec un professionnel.",
    },
  ]);
  const [texte, setTexte] = useState("");
  const [isSending, setIsSending] = useState(false);
  const finRef = useRef(null);

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const envoyer = async (e) => {
    e.preventDefault();
    if (!texte.trim() || isSending) return;

    const nouveauMessage = { role: "user", contenu: texte.trim() };
    const historique = [...messages, nouveauMessage];
    setMessages(historique);
    setTexte("");
    setIsSending(true);

    try {
      const res = await api.post("/assistant/chat", {
        message: nouveauMessage.contenu,
        historique: messages,
      });
      setMessages((prev) => [
        ...prev,
        { role: "assistant", contenu: res.data.reponse },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          contenu:
            error.response?.data?.message ||
            "Désolé, une erreur est survenue. Réessayez dans un instant.",
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="assistant-page">
      <header className="assistant-header">
        <h1>🤖 Assistant MediConnect</h1>
        <p>
          Posez vos questions sur l'utilisation de la plateforme ou des
          questions générales de santé.
        </p>
      </header>

      <div className="assistant-chatbox">
        <div className="assistant-messages">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`assistant-bubble ${m.role === "user" ? "mine" : "bot"}`}
            >
              {m.role === "assistant" && <span className="assistant-avatar">🤖</span>}
              <p>{m.contenu}</p>
            </div>
          ))}

          {isSending && (
            <div className="assistant-bubble bot">
              <span className="assistant-avatar">🤖</span>
              <p className="assistant-typing">...</p>
            </div>
          )}

          <div ref={finRef} />
        </div>

        <form className="assistant-input-row" onSubmit={envoyer}>
          <input
            type="text"
            placeholder="Écrivez votre question..."
            value={texte}
            onChange={(e) => setTexte(e.target.value)}
          />
          <button type="submit" disabled={isSending || !texte.trim()}>
            Envoyer
          </button>
        </form>
      </div>

      <p className="assistant-disclaimer">
        ⚠️ Cet assistant ne pose pas de diagnostic et ne remplace pas une
        consultation médicale. En cas d'urgence, contactez immédiatement les
        secours.
      </p>
    </div>
  );
}

export default AssistantIA;