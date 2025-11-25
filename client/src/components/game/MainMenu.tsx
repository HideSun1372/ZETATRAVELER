import { useRPG } from "@/lib/stores/useRPG";

export function MainMenu() {
  const setGamePhase = useRPG((state) => state.setGamePhase);

  const handleStart = () => {
    console.log("Starting game...");
    setGamePhase("overworld");
  };

  return (
    <div className="w-full h-full bg-black flex flex-col items-center justify-center select-none">
      <div className="text-center">
        <div className="space-y-6">
          <button
            onClick={handleStart}
            className="block w-64 mx-auto py-3 text-2xl text-white border-4 border-white hover:bg-white hover:text-black transition-colors cursor-pointer"
            style={{ fontFamily: "'Courier New', monospace" }}
          >
            START GAME
          </button>
        </div>

        <div className="mt-16 space-y-2">
          <p 
            className="text-gray-500 text-sm"
            style={{ fontFamily: "'Courier New', monospace" }}
          >
            WASD or Arrow Keys to move
          </p>
          <p 
            className="text-gray-500 text-sm"
            style={{ fontFamily: "'Courier New', monospace" }}
          >
            Z or Enter to confirm
          </p>
          <p 
            className="text-gray-500 text-sm"
            style={{ fontFamily: "'Courier New', monospace" }}
          >
            X or Shift to cancel
          </p>
        </div>
      </div>
      
      <p 
        className="absolute bottom-8 text-gray-600 text-xs"
        style={{ fontFamily: "'Courier New', monospace" }}
      >
        A journey through dimensions awaits...
      </p>
    </div>
  );
}
