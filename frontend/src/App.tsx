import { useEffect, useState } from "react";
import { useRPG } from "./lib/stores/useRPG";
import { MainMenu } from "./components/game/MainMenu";
import { VesselCreator } from "./components/game/VesselCreator";
import { IntroCutscene } from "./components/game/IntroCutscene";
import { Hub } from "./components/game/Hub";
import { Planet } from "./components/game/Planet";
import { Battle } from "./components/game/Battle";
import { GameOver } from "./components/game/GameOver";
import { ColdStartScreen } from "./components/game/ColdStartScreen";
import { Analytics } from "@vercel/analytics/react"

function App() {
  const gamePhase = useRPG((state) => state.gamePhase);
  const setGamePhase = useRPG((state) => state.setGamePhase);
  const setVesselName = useRPG((state) => state.setVesselName);
  const vesselName = useRPG((state) => state.vesselName);
  const [initialized, setInitialized] = useState(false);
  const [backendReady, setBackendReady] = useState(false);

  useEffect(() => {
    const poll = () => {
      fetch("/api/health")
        .then(res => { if (res.ok) setBackendReady(true); else setTimeout(poll, 2000); })
        .catch(() => setTimeout(poll, 2000));
    };
    poll();
  }, []);

  // Check for save files on startup and decide initial phase
  useEffect(() => {
    if (initialized) return;

    const hasSaveFiles =
      localStorage.getItem("zetatraveler_save_1") ||
      localStorage.getItem("zetatraveler_save_2") ||
      localStorage.getItem("zetatraveler_save_3");

    if (hasSaveFiles) {
      setGamePhase("menu");
    } else {
      setGamePhase("vessel");
    }
    setInitialized(true);
  }, [initialized, setGamePhase]);

  const handleVesselComplete = (_name: string) => {
    setVesselName(_name);
    setGamePhase("intro");
  };

  const handleIntroComplete = () => {
    setGamePhase("hub");
  };

  if (!backendReady) return <ColdStartScreen />;

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      {gamePhase === "vessel" && (
        <VesselCreator onComplete={handleVesselComplete} />
      )}

      {gamePhase === "intro" && (
        <IntroCutscene playerName={vesselName} onComplete={handleIntroComplete} />
      )}

      {gamePhase === "menu" && <MainMenu />}
      
      {gamePhase === "hub" && <Hub />}
      
      {gamePhase === "planet" && <Planet />}
      
      {gamePhase === "battle" && <Battle />}
      
      {gamePhase === "gameover" && <GameOver />}
    </div>
  );
}

export default App;
