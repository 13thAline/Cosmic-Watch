import { useState, useEffect } from "react";
import io from "socket.io-client";

const socket = io.connect("http://localhost:5000"); // Backend URL

const Chat = () => {
  const [message, setMessage] = useState("");
  const [chatLog, setChatLog] = useState([]);

  useEffect(() => {
    socket.on("receive_message", (data) => {
      setChatLog((prev) => [...prev, data]);
    });
    return () => socket.off("receive_message");
  }, []);

  const sendMessage = () => {
    if (message !== "") {
      socket.emit("send_message", { text: message, time: new Date().toLocaleTimeString() });
      setMessage("");
    }
  };

  return (
    <div className="pt-24 p-10 max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-orange-500">Global Comms</h2>
      <div className="bg-white/5 border border-white/10 rounded-xl h-96 overflow-y-auto p-4 mb-4">
        {chatLog.map((msg, i) => (
          <div key={i} className="mb-2">
            <span className="text-xs text-gray-500 mr-2">{msg.time}</span>
            <p className="bg-white/10 inline-block px-3 py-1 rounded-lg">{msg.text}</p>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input 
          className="flex-1 bg-black border border-white/20 rounded-lg px-4 py-2 outline-none focus:border-orange-500"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage} className="bg-orange-600 px-6 py-2 rounded-lg font-bold">Send</button>
      </div>
    </div>
  );
};

export default Chat;