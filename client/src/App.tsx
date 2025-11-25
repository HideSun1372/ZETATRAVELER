import { useRPG } from "./lib/stores/useRPG";
import { MainMenu } from "./components/game/MainMenu";
import { Intro } from "./components/game/Intro";
import { NameInput } from "./components/game/NameInput";
import "@fontsource/inter";

function App() {
  const gamePhase = useRPG((state) => state.gamePhase);
  const setGamePhase = useRPG((state) => state.setGamePhase);
  const setPlayerName = useRPG((state) => state.setPlayerName);

  const handleNameComplete = (name: string) => {
    setPlayerName(name);
    setGamePhase("menu");
  };

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      {gamePhase === "intro" && (
        <Intro onComplete={() => setGamePhase("naming")} />
      )}

      {gamePhase === "naming" && (
        <NameInput onComplete={handleNameComplete} />
      )}

      {gamePhase === "menu" && <MainMenu />}
      
      {gamePhase === "overworld" && (
        <div className="w-full h-full bg-black flex items-center justify-center">
          <p className="text-white text-2xl" style={{ fontFamily: "'Courier New', monospace" }}>
            Overworld coming soon...
          </p>
        </div>
      )}
      
      {gamePhase === "battle" && (
        <div className="w-full h-full bg-black flex items-center justify-center">
          <p className="text-white text-2xl" style={{ fontFamily: "'Courier New', monospace" }}>
            Battle coming soon...
          </p>
        </div>
      )}
    </div>
  );
}

export default App;
