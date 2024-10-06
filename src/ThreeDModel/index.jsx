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

// Component for Near-Earth Asteroid visualization
const NEAsteroid = ({ object, position, color = "#ffffff", onClick }) => {
  // Increased base size and scaling factor for better visibility
  const size = Math.max(0.3, object.diameter * 0.4);

  return (
    <mesh
      position={[position.x, position.y, position.z]}
      onClick={(e) => {
        e.stopPropagation();
        onClick(object);
      }}
    >
      <sphereGeometry args={[size, 32, 32]} />
      <meshStandardMaterial
        color={color}
        roughness={0.3} // Reduced roughness for more shine
        metalness={0.6} // Increased metalness for better reflection
        emissive={color}
        emissiveIntensity={0.4} // Increased glow
      />
      {/* Add a glowing halo effect */}
      <mesh scale={[1.2, 1.2, 1.2]}>
        <sphereGeometry args={[size, 32, 32]} />
        <meshBasicMaterial color={color} transparent={true} opacity={0.1} />
      </mesh>
    </mesh>
  );
};

export default function ThreeDModel() {
  const [selectedObject, setSelectedObject] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState("solar-system");
  const [asteroidData, setAsteroidData] = useState([]);

  const [necData, setNecData] = useState([]);
  // Fetch asteroid data
  useEffect(() => {
    const fetchAsteroidData = async () => {
      try {
        // Using NASA's NeoWs API
        const API_KEY = "JOamhJp46xJMVSeu2ceMovhGcqmdcOTFplwpYokr"; // Replace with your NASA API key
        const today = new Date().toISOString().split("T")[0];
        const response = await fetch(
          `https://api.nasa.gov/neo/rest/v1/feed?start_date=${today}&end_date=${today}&api_key=${API_KEY}`
        );
        const data = await response.json();

        // Extract near earth asteroids
        const asteroids = Object.values(data.near_earth_objects)
          .flat()
          .map((asteroid) => ({
            id: asteroid.id,
            name: asteroid.name,
            diameter:
              asteroid.estimated_diameter.kilometers.estimated_diameter_max,
            hazardous: asteroid.is_potentially_hazardous_asteroid,
            distance:
              asteroid.close_approach_data[0].miss_distance.astronomical,
            velocity:
              asteroid.close_approach_data[0].relative_velocity
                .kilometers_per_second,
            orbit: {
              semi_major_axis: asteroid.orbital_data?.semi_major_axis || 1,
              eccentricity: asteroid.orbital_data?.eccentricity || 0,
              inclination: asteroid.orbital_data?.inclination || 0,
            },
          }));

        setAsteroidData(asteroids);
      } catch (error) {
        console.error("Error fetching asteroid data:", error);
      }
    };

    if (viewMode === "asteroids") {
      fetchAsteroidData();
    }
  }, [viewMode]);
  console.log(asteroidData);

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

  const calculateAsteroidPosition = (asteroid) => {
    // Increased distance scaling for better spread
    const distance = parseFloat(asteroid.distance);
    const scaledDistance = distance * 40; // Increased scale factor

    const velocity = parseFloat(asteroid.velocity);
    const angle = (velocity / 30) * Math.PI;

    // Create a unique but consistent angle for each asteroid based on its ID
    const uniqueOffset = parseInt(asteroid.id, 10) % 360;
    const finalAngle = angle + (uniqueOffset * Math.PI) / 180;

    // Calculate base position using spherical coordinates
    const x = scaledDistance * Math.cos(finalAngle);
    const z = scaledDistance * Math.sin(finalAngle);

    // Increased vertical variation
    const inclination = asteroid.orbit?.inclination || 0;
    const y = (inclination / 45) * scaledDistance * 0.8;

    return { x, y, z };
  };

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

  const handleSendMessage = async () => {
    if (!query.trim()) return;
    setQuery("");
    setIsLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:5000/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });
      console.log(response);

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

  const handleObjectClick = (object) => {
    setSelectedObject(object);
  };
  // Render object information overlay
  const renderObjectInfo = () => {
    if (!selectedObject) return null;

    return (
      <div
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          padding: "20px",
          borderRadius: "10px",
          color: "white",
          maxWidth: "300px",
          zIndex: 1000,
        }}
      >
        <h3>{selectedObject.name}</h3>
        <p>Diameter: {(selectedObject.diameter * 1000).toFixed(2)} meters</p>
        <p>Distance from Earth: {selectedObject.distance} AU</p>
        <p>Velocity: {selectedObject.velocity} km/s</p>
        <p>Potentially Hazardous: {selectedObject.hazardous ? "Yes" : "No"}</p>
      </div>
    );
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
        <button
          onClick={() => setViewMode("asteroids")}
          style={{
            backgroundColor: viewMode === "asteroids" ? "#3182ce" : "#4a5568",
            color: "white",
            padding: "8px 16px",
            margin: "0 4px",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Near-Earth Asteroids
        </button>
      </div>
      {/* Object Information Overlay */}
      {renderObjectInfo()}
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

        {viewMode === "asteroids" && (
          <>
            <Earth position={[0, 0, 0]} />
            {asteroidData.map((asteroid) => {
              const position = calculateAsteroidPosition(asteroid);
              return (
                <NEAsteroid
                  key={asteroid.id}
                  object={asteroid}
                  position={position}
                  color={asteroid.hazardous ? "#ff4444" : "#aaaaaa"}
                  onClick={handleObjectClick}
                />
              );
            })}
          </>
        )}
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
                value={query}
                onChange={(e) => setQuery(e.target.value)}
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
