import { useRPG } from "./lib/stores/useRPG";
import { MainMenu } from "./components/game/MainMenu";
import { VesselCreator } from "./components/game/VesselCreator";
import { Hub } from "./components/game/Hub";
import { Planet } from "./components/game/Planet";
import { Battle } from "./components/game/Battle";
import "@fontsource/inter";

function App() {
  const gamePhase = useRPG((state) => state.gamePhase);
  const setGamePhase = useRPG((state) => state.setGamePhase);
  const setVesselName = useRPG((state) => state.setVesselName);

  const handleVesselComplete = (name: string) => {
    setVesselName(name);
    setGamePhase("hub");
  };

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      {gamePhase === "vessel" && (
        <VesselCreator onComplete={handleVesselComplete} />
      )}

      {gamePhase === "menu" && <MainMenu />}
      
      {gamePhase === "hub" && <Hub />}
      
      {gamePhase === "planet" && <Planet />}
      
      {gamePhase === "battle" && <Battle />}
    </div>
  );
}

export default App;
