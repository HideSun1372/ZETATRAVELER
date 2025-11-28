import { useEffect, useState } from "react";
import { useRPG } from "./lib/stores/useRPG";
import { MainMenu } from "./components/game/MainMenu";
import { VesselCreator } from "./components/game/VesselCreator";
import { IntroCutscene } from "./components/game/IntroCutscene";
import { Hub } from "./components/game/Hub";
import { Planet } from "./components/game/Planet";
import { Battle } from "./components/game/Battle";
import { GameOver } from "./components/game/GameOver";
import "@fontsource/inter";

const SKIP_VESSEL_CREATION = false;

function App() {
  const gamePhase = useRPG((state) => state.gamePhase);
  const setGamePhase = useRPG((state) => state.setGamePhase);
  const setVesselName = useRPG((state) => state.setVesselName);
  const vesselName = useRPG((state) => state.vesselName);
  const [initialized, setInitialized] = useState(false);

  // Check for save files on startup and decide initial phase
  useEffect(() => {
    if (initialized) return;
    
    // Check if any save files exist
    const hasSaveFiles = 
      localStorage.getItem('zetatraveler_save_1') ||
      localStorage.getItem('zetatraveler_save_2') ||
      localStorage.getItem('zetatraveler_save_3');
    
    if (hasSaveFiles) {
      // Save files exist - show menu
      setGamePhase("menu");
    } else {
      // No save files - start new game directly
      if (SKIP_VESSEL_CREATION) {
        setVesselName("Aiden");
        setGamePhase("intro");
      } else {
        setGamePhase("vessel");
      }
    }
    setInitialized(true);
  }, [initialized, setGamePhase, setVesselName]);

  const handleVesselComplete = (_name: string) => {
    // The vessel creation is a fake-out - the player's real name is always Aiden
    setVesselName("Aiden");
    setGamePhase("intro");
  };

  const handleIntroComplete = () => {
    setGamePhase("hub");
  };

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      {gamePhase === "vessel" && !SKIP_VESSEL_CREATION && (
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
