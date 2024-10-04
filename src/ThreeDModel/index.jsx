import { Canvas } from "@react-three/fiber";
import { Fragment, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";

import Controls from "./Controls";
import Panel from "./Panel";
import Planet from "./Planet";
import Sun from "./Sun";

export default function ThreeDModel() {
  const [selectedPlanet, setSelectedPlanet] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPlanetInfo, setShowPlanetInfo] = useState(true);

  const planets = [
    {
      name: "mercury",
      speed: 48,
      position: 1.75,
      color: "white",
      size: 4879.4,
      photo: "/mercury.jpg",
    },
    {
      name: "venus",
      speed: 35,
      position: 2.5,
      color: "orange",
      size: 12104,
      photo: "/venus.jpg",
    },
    {
      name: "earth",
      speed: 30,
      position: 3.5,
      color: "#388cf3",
      size: 12742,
      photo: "/earth.jpg",
    },
    {
      name: "mars",
      speed: 24,
      position: 4.5,
      color: "red",
      size: 6779,
      photo: "/mars.jpg",
    },
    {
      name: "jupiter",
      speed: 13,
      position: 6,
      color: "orange",
      size: 139820,
      photo: "/jupter.jpg",
    },
    {
      name: "saturn",
      speed: 10,
      position: 8,
      color: "yellow",
      size: 116460,
      photo: "/saturn.jpg",
    },
    {
      name: "uranus",
      speed: 7,
      position: 10,
      color: "lightBlue",
      size: 50724,
      photo: "/uranus.jpg",
    },
    {
      name: "neptune",
      speed: 5,
      position: 11.5,
      color: "purple",
      size: 49244,
      photo: "/neptune.jpg",
    },
  ];

  const handlePlanetClick = (planet) => {
    if (selectedPlanet?.name === planet.name) {
      // If clicking the same planet, toggle the info display
      setShowPlanetInfo(!showPlanetInfo);
    } else {
      // If clicking a different planet, select it and show its info
      setSelectedPlanet(planet);
      setShowPlanetInfo(true);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const newMessage = {
      text: inputMessage,
      isUser: true,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ queryText: inputMessage }),
      });

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          text:
            data.response ||
            "Sorry, there was an error processing your request.",
          isUser: false,
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          text: "Sorry, there was an error processing your request.",
          isUser: false,
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        backgroundImage: 'url("bg.jpg")',
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center center",
        position: "relative",
      }}
    >
      {/* Navbar */}
      <nav
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          backgroundColor: "rgba(0, 0, 0, 0.7)",
        }}
      >
        <ul
          style={{
            display: "flex",
            justifyContent: "space-around",
            listStyleType: "none",
            padding: "10px 0",
          }}
        >
          {planets.map((planet) => (
            <li
              key={planet.name}
              style={{
                color: "white",
                cursor: "pointer",
                padding: "5px 10px",
                borderRadius: "4px",
                backgroundColor:
                  selectedPlanet?.name === planet.name
                    ? "rgba(255, 255, 255, 0.2)"
                    : "transparent",
                transition: "background-color 0.3s ease",
              }}
              onClick={() => handlePlanetClick(planet)}
            >
              {planet.name.charAt(0).toUpperCase() + planet.name.slice(1)}
            </li>
          ))}
        </ul>
      </nav>

      {/* Planet Info Box */}
      {selectedPlanet && showPlanetInfo && (
        <div
          style={{
            position: "absolute",
            top: "50px",
            right: "10px",
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            padding: "15px",
            borderRadius: "8px",
            color: "white",
          }}
        >
          <h3>{selectedPlanet.name.toUpperCase()}</h3>
          <p>Orbital Speed: {selectedPlanet.speed} km/s</p>
          <p>Size: {selectedPlanet.size} km</p>
          <p>Color: {selectedPlanet.color}</p>
        </div>
      )}

      {/* Chat Sidebar */}
      <div
        style={{
          position: "fixed",
          right: 0,
          top: 0,
          height: "100vh",
          width: isChatOpen ? "300px" : "50px",
          backgroundColor: "rgba(0, 0, 0, 0.9)",
          transition: "width 0.3s ease",
          display: "flex",
          flexDirection: "column",
          zIndex: 1000,
        }}
      >
        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          style={{
            backgroundColor: "transparent",
            border: "none",
            padding: "10px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {isChatOpen ? (
            <X color="white" size={24} />
          ) : (
            <MessageCircle color="white" size={24} />
          )}
        </button>

        {isChatOpen && (
          <>
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "10px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              {messages.map((message, index) => (
                <div
                  key={index}
                  style={{
                    alignSelf: message.isUser ? "flex-end" : "flex-start",
                    backgroundColor: message.isUser ? "#4a5568" : "#2d3748",
                    padding: "8px 12px",
                    borderRadius: "12px",
                    maxWidth: "80%",
                    color: "white",
                  }}
                >
                  {message.text}
                </div>
              ))}
              {isLoading && (
                <div
                  style={{
                    alignSelf: "flex-start",
                    backgroundColor: "#2d3748",
                    padding: "8px 12px",
                    borderRadius: "12px",
                    color: "white",
                  }}
                >
                  Thinking...
                </div>
              )}
            </div>
            <div
              style={{
                padding: "10px",
                borderTop: "1px solid #4a5568",
                display: "flex",
                gap: "8px",
              }}
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Type your message..."
                style={{
                  flex: 1,
                  padding: "8px",
                  borderRadius: "4px",
                  border: "none",
                  backgroundColor: "#4a5568",
                  color: "white",
                }}
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading}
                style={{
                  backgroundColor: "#3182ce",
                  border: "none",
                  borderRadius: "4px",
                  padding: "8px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Send color="white" size={20} />
              </button>
            </div>
          </>
        )}
      </div>

      <Canvas shadows camera={{ position: [2, -16, 5] }}>
        <ambientLight color="white" intensity={0.4} />
        <Sun position={[0, 0, 0]} />
        {planets.map((planet, i) => (
          <Fragment key={i}>
            <Planet {...planet} />
          </Fragment>
        ))}
        <Controls />
      </Canvas>

      <Panel />
    </div>
  );
}
