import { useState, useEffect } from "react";
import io from "socket.io-client";

const socket = io.connect("http://localhost:5000");

/* ======================================================
   ASTEROID DATA + FACTS
   ====================================================== */

const ASTEROIDS = [
  {
    id: "54580776",
    name: "(2026 CC)",
    missDistanceKm: 610491,
  },
  {
    id: "3799250",
    name: "(2018 CE1)",
    missDistanceKm: 55910608,
  },
  {
    id: "coming-soon",
    name: "More asteroids",
    comingSoon: true,
  },
];

const ASTEROID_FACTS = {
  "54580776": [
    "Asteroids like this one are remnants from the earliest days of the solar system.",
    "Even when far from Earth, asteroids move at extremely high speeds through space.",
    "Close observations help scientists refine orbital predictions and safety models.",
  ],
  "3799250": [
    "Most asteroids are irregular in shape rather than perfectly round.",
    "Some asteroids contain large amounts of metal such as iron and nickel.",
    "Studying these objects helps scientists understand how planets formed.",
  ],
};

/* ======================================================
   ASTEROID BOY SYSTEM MESSAGE
   ====================================================== */

function asteroidBoyIntro(asteroid) {
  if (asteroid.comingSoon) {
    return {
      type: "system",
      sender: "Asteroid Boy",
      text:
        "I am Asteroid Boy.\n\n" +
        "This is a global communication channel where asteroids are discussed one at a time.\n\n" +
        "Additional asteroid channels are coming soon as more data becomes available.",
    };
  }

  const facts = ASTEROID_FACTS[asteroid.id] || [];

  return {
    type: "system",
    sender: "Asteroid Boy",
    text:
      "I am Asteroid Boy.\n\n" +
      "This is a global communication channel focused on a single asteroid.\n" +
      "People here observe, discuss, and ask questions about this object together.\n\n" +
      `This asteroid ${asteroid.name} is passing Earth at a distance of ` +
      `${asteroid.missDistanceKm.toLocaleString()} kilometers.\n\n` +
      facts.map((f) => `• ${f}`).join("\n\n") +
      "\n\nYou can ask things like:\n" +
      "• How far is this asteroid from Earth?\n" +
      "• Is this asteroid dangerous?\n" +
      "• How do scientists track asteroids?\n" +
      "• What would happen if an asteroid changed course?",
  };
}

/* ======================================================
   ASTEROID BOY CHATBOT LOGIC
   ====================================================== */

function asteroidBoyReply(text) {
  const msg = text.toLowerCase();

  if (msg.includes("distance") || msg.includes("how far")) {
    return (
      "The distance tells us how close the asteroid’s path comes to Earth. " +
      "Larger distances generally mean lower risk."
    );
  }

  if (msg.includes("danger") || msg.includes("risk")) {
    return (
      "Most near-Earth asteroids are not dangerous. " +
      "Risk depends on size, speed, and trajectory, all of which are closely monitored."
    );
  }

  if (msg.includes("track") || msg.includes("detect")) {
    return (
      "Scientists track asteroids using ground-based telescopes and radar systems. " +
      "This allows precise measurement of their motion."
    );
  }

  if (msg.includes("what") || msg.includes("asteroid")) {
    return (
      "Asteroids are rocky objects that orbit the Sun. " +
      "They are natural parts of the solar system and pass Earth regularly."
    );
  }

  return (
    "That’s a good question. You can ask about distance, risk, " +
    "or how asteroids behave in space."
  );
}

/* ======================================================
   CHAT COMPONENT
   ====================================================== */

const Chat = () => {
  const [message, setMessage] = useState("");
  const [chatLog, setChatLog] = useState([]);
  const [activeAsteroid, setActiveAsteroid] = useState(ASTEROIDS[0]);

  /* ---------- SWITCH ASTEROID ---------- */
  useEffect(() => {
    socket.emit("join_asteroid", activeAsteroid.id);
    setChatLog([asteroidBoyIntro(activeAsteroid)]);
  }, [activeAsteroid]);

  /* ---------- RECEIVE MESSAGE ---------- */
  useEffect(() => {
    socket.on("receive_message", (data) => {
      setChatLog((prev) => [
        ...prev,
        {
          type: "user",
          sender: "User",
          text: data.text,
        },
        {
          type: "system",
          sender: "Asteroid Boy",
          text: asteroidBoyReply(data.text),
        },
      ]);
    });

    return () => socket.off("receive_message");
  }, []);

  /* ---------- SEND MESSAGE ---------- */
  const sendMessage = () => {
    if (!message.trim()) return;

    socket.emit("send_message", {
      asteroidId: activeAsteroid.id,
      text: message,
    });

    setMessage("");
  };

  return (
    <div className="pt-24 px-10 max-w-5xl mx-auto text-white">
      <h2 className="text-3xl font-bold mb-6 text-orange-500">
        Global Comms
      </h2>

      {/* ASTEROID SELECTOR */}
      <div className="flex gap-3 mb-6">
        {ASTEROIDS.map((a) => (
          <button
            key={a.id}
            onClick={() => setActiveAsteroid(a)}
            className={`
              px-4 py-2 rounded-full text-sm font-semibold
              ${
                activeAsteroid.id === a.id
                  ? "bg-orange-600 text-black"
                  : "bg-white/10 hover:bg-white/20"
              }
            `}
          >
            {a.name}
          </button>
        ))}
      </div>

      {/* CHAT BOX */}
      <div className="bg-white/5 border border-white/10 rounded-2xl h-96 overflow-y-auto p-4 mb-4 space-y-4">
        {chatLog.map((msg, i) => (
          <div key={i}>
            {msg.type === "system" ? (
              <div className="bg-white/10 border border-white/15 rounded-xl p-4 text-sm whitespace-pre-line">
                <strong>{msg.sender}:</strong>
                <div className="mt-2">{msg.text}</div>
              </div>
            ) : (
              <div className="text-right">
                <span className="inline-block bg-orange-600/80 px-3 py-1 rounded-lg">
                  {msg.text}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* INPUT */}
      <div className="flex gap-2">
        <input
          className="flex-1 bg-black border border-white/20 rounded-lg px-4 py-2 outline-none focus:border-orange-500"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask Asteroid Boy a question..."
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          onClick={sendMessage}
          className="bg-orange-600 px-6 py-2 rounded-lg font-bold hover:bg-orange-500"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
