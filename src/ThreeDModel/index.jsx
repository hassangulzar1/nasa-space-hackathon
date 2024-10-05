import { Canvas } from "@react-three/fiber";
import { Fragment, useState, useEffect } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { planets } from "@/components/Planet";
import Controls from "./Controls";
import Planet from "./Planet";
import Sun from "./Sun";
import Earth from "./Earth";
// New component for Near-Earth Comet visualization
const NEComet = ({ object, position, color = "#ffffff" }) => {
  return (
    <mesh position={[position.x, position.y, position.z]}>
      <sphereGeometry args={[0.1, 32, 32]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
};

export default function ThreeDModel() {
  const [selectedPlanet, setSelectedPlanet] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPlanetInfo, setShowPlanetInfo] = useState(true);
  const [viewMode, setViewMode] = useState("solar-system"); // 'solar-system' or 'nec'

  const [necData, setNecData] = useState([]);
  // Fetch NEC data
  useEffect(() => {
    const fetchNECData = async () => {
      try {
        const response = await fetch(
          "https://data.nasa.gov/resource/b67r-rgxc.json"
        ); // Replace with your actual API endpoint
        const data = await response.json();
        setNecData(data);
      } catch (error) {
        console.error("Error fetching NEC data:", error);
      }
    };

    if (viewMode === "nec") {
      fetchNECData();
    }
  }, [viewMode]);

  // Convert orbital elements to Cartesian coordinates
  const calculateNECPosition = (nec) => {
    const a = (parseFloat(nec.q_au_1) + parseFloat(nec.q_au_2)) / 2; // Semi-major axis
    const e = parseFloat(nec.e);
    const i = (parseFloat(nec.i_deg) * Math.PI) / 180;
    const omega = (parseFloat(nec.w_deg) * Math.PI) / 180;

    // Simple position calculation (you might want to make this more accurate)
    const x = a * Math.cos(omega);
    const y = a * Math.sin(omega) * Math.cos(i);
    const z = a * Math.sin(omega) * Math.sin(i);

    return { x, y, z };
  };

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
      {/* View Mode Toggle */}
      <div
        style={{
          position: "absolute",
          top: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 1000,
        }}
      >
        <button
          onClick={() => setViewMode("solar-system")}
          style={{
            backgroundColor:
              viewMode === "solar-system" ? "#3182ce" : "#4a5568",
            color: "white",
            padding: "8px 16px",
            margin: "0 4px",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Solar System
        </button>
        <button
          onClick={() => setViewMode("nec")}
          style={{
            backgroundColor: viewMode === "nec" ? "#3182ce" : "#4a5568",
            color: "white",
            padding: "8px 16px",
            margin: "0 4px",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Near-Earth Comets
        </button>
      </div>
      {/* Main 3D Canvas */}
      <Canvas shadows camera={{ position: [2, -16, 5] }}>
        <ambientLight color="white" intensity={0.4} />

        {viewMode === "solar-system" ? (
          <Sun position={[0, 0, 0]} />
        ) : (
          <Earth position={[0, 0, 0]} />
        )}

        {viewMode === "solar-system" &&
          planets.map((planet, i) => (
            <Fragment key={i}>
              <Planet {...planet} />
            </Fragment>
          ))}

        {viewMode === "nec" &&
          necData.map((nec, index) => {
            const position = calculateNECPosition(nec);
            return (
              <NEComet
                key={index}
                object={nec}
                position={position}
                color={`hsl(${(index * 30) % 360}, 70%, 50%)`}
              />
            );
          })}

        <Controls />
      </Canvas>

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
    </div>
  );
}
