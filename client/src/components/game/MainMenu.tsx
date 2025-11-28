import { useState, useEffect } from "react";
import { useRPG } from "@/lib/stores/useRPG";

interface SaveSlot {
  slot: number;
  data: string | null;
  timestamp: string | null;
  playerName?: string;
  level?: number;
  playTime?: string;
  nebuliTotal?: number;
  currentRoute?: string;
}

export function MainMenu() {
  const { 
    setGamePhase, 
    saveSlots: rpgSaveSlots, 
    loadGame,
    playerName,
    setVesselName,
  } = useRPG();
  
  const [menuState, setMenuState] = useState<"main" | "new" | "continue" | "settings">("main");
  const [selectedSlot, setSelectedSlot] = useState(0);
  const [saveSlots, setSaveSlots] = useState<SaveSlot[]>([]);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  useEffect(() => {
    const slots: SaveSlot[] = [];
    for (let i = 1; i <= 3; i++) {
      const savedData = localStorage.getItem(`zetatraveler_save_${i}`);
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          slots.push({
            slot: i,
            data: savedData,
            timestamp: localStorage.getItem(`zetatraveler_save_${i}_timestamp`) || new Date().toISOString(),
            playerName: parsed.playerName || "Unknown",
            level: parsed.level || 1,
            nebuliTotal: parsed.nebuliTotal || 0,
            currentRoute: parsed.currentRoute || "neutral",
          });
        } catch {
          slots.push({ slot: i, data: null, timestamp: null });
        }
      } else {
        slots.push({ slot: i, data: null, timestamp: null });
      }
    }
    setSaveSlots(slots);
  }, [menuState]);

  const handleNewGame = () => {
    // Skip vessel creation temporarily - go straight to intro
    setVesselName("Aiden");
    setGamePhase("intro");
  };

  const handleContinue = (slot: number) => {
    loadGame(slot);
    setGamePhase("hub");
  };

  const handleDeleteSave = (slot: number) => {
    localStorage.removeItem(`zetatraveler_save_${slot}`);
    localStorage.removeItem(`zetatraveler_save_${slot}_timestamp`);
    setConfirmDelete(null);
    setSaveSlots(prev => prev.map(s => 
      s.slot === slot ? { slot, data: null, timestamp: null } : s
    ));
  };

  const handleExportSave = (slot: number) => {
    const saveData = localStorage.getItem(`zetatraveler_save_${slot}`);
    if (saveData) {
      const blob = new Blob([saveData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `zetatraveler_save_slot${slot}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleImportSave = (slot: number) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          try {
            const data = ev.target?.result as string;
            JSON.parse(data);
            localStorage.setItem(`zetatraveler_save_${slot}`, data);
            localStorage.setItem(`zetatraveler_save_${slot}_timestamp`, new Date().toISOString());
            setMenuState("main");
            setTimeout(() => setMenuState("continue"), 100);
          } catch (err) {
            console.error("Invalid save file");
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const formatDate = (timestamp: string | null) => {
    if (!timestamp) return "";
    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return "";
    }
  };

  const getRouteColor = (route?: string) => {
    switch (route) {
      case 'pacifist': return 'text-green-400';
      case 'genocide': return 'text-red-400';
      default: return 'text-yellow-400';
    }
  };

  const hasSaves = saveSlots.some(s => s.data !== null);

  return (
    <div className="w-full h-full bg-black flex flex-col items-center justify-center select-none">
      <h1 
        className="text-5xl text-white mb-12 tracking-widest"
        style={{ fontFamily: "'Courier New', monospace" }}
      >
        ZETATRAVELER
      </h1>

      {menuState === "main" && (
        <div className="text-center space-y-4">
          <button
            onClick={handleNewGame}
            className="block w-64 mx-auto py-3 text-2xl text-white border-4 border-white hover:bg-white hover:text-black transition-colors cursor-pointer"
            style={{ fontFamily: "'Courier New', monospace" }}
          >
            NEW GAME
          </button>
          
          <button
            onClick={() => hasSaves ? setMenuState("continue") : null}
            className={`block w-64 mx-auto py-3 text-2xl border-4 transition-colors cursor-pointer ${
              hasSaves 
                ? "text-white border-white hover:bg-white hover:text-black" 
                : "text-gray-600 border-gray-600 cursor-not-allowed"
            }`}
            style={{ fontFamily: "'Courier New', monospace" }}
            disabled={!hasSaves}
          >
            CONTINUE
          </button>

          <button
            onClick={() => setMenuState("settings")}
            className="block w-64 mx-auto py-3 text-xl text-gray-400 border-2 border-gray-600 hover:border-gray-400 hover:text-white transition-colors cursor-pointer"
            style={{ fontFamily: "'Courier New', monospace" }}
          >
            SETTINGS
          </button>
        </div>
      )}

      {menuState === "continue" && (
        <div className="text-center space-y-4 w-96">
          <h2 
            className="text-2xl text-white mb-6"
            style={{ fontFamily: "'Courier New', monospace" }}
          >
            SELECT SAVE FILE
          </h2>

          {saveSlots.map((slot, index) => (
            <div key={slot.slot} className="relative">
              {confirmDelete === slot.slot ? (
                <div 
                  className="w-full p-4 border-4 border-red-500 bg-red-900/30"
                  style={{ fontFamily: "'Courier New', monospace" }}
                >
                  <p className="text-red-400 mb-3">Delete this save?</p>
                  <div className="flex justify-center gap-4">
                    <button
                      onClick={() => handleDeleteSave(slot.slot)}
                      className="px-4 py-1 text-red-400 border border-red-400 hover:bg-red-400 hover:text-black"
                    >
                      YES
                    </button>
                    <button
                      onClick={() => setConfirmDelete(null)}
                      className="px-4 py-1 text-white border border-white hover:bg-white hover:text-black"
                    >
                      NO
                    </button>
                  </div>
                </div>
              ) : slot.data ? (
                <div 
                  className={`w-full p-4 border-4 transition-colors cursor-pointer ${
                    selectedSlot === index 
                      ? "border-yellow-400 bg-yellow-900/20" 
                      : "border-gray-600 hover:border-white"
                  }`}
                  style={{ fontFamily: "'Courier New', monospace" }}
                  onClick={() => setSelectedSlot(index)}
                  onDoubleClick={() => handleContinue(slot.slot)}
                >
                  <div className="flex justify-between items-start">
                    <div className="text-left">
                      <p className="text-white text-lg">
                        SLOT {slot.slot}: {slot.playerName}
                      </p>
                      <p className="text-gray-400 text-sm">
                        LV {slot.level} | Cores: {slot.nebuliTotal}/50
                      </p>
                      <p className={`text-sm ${getRouteColor(slot.currentRoute)}`}>
                        {slot.currentRoute?.toUpperCase()} ROUTE
                      </p>
                    </div>
                    <div className="text-right text-gray-500 text-xs">
                      {formatDate(slot.timestamp)}
                    </div>
                  </div>
                  
                  {selectedSlot === index && (
                    <div className="flex justify-center gap-2 mt-3 pt-3 border-t border-gray-700">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleContinue(slot.slot); }}
                        className="px-3 py-1 text-sm text-green-400 border border-green-400 hover:bg-green-400 hover:text-black"
                      >
                        LOAD
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleExportSave(slot.slot); }}
                        className="px-3 py-1 text-sm text-blue-400 border border-blue-400 hover:bg-blue-400 hover:text-black"
                      >
                        EXPORT
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setConfirmDelete(slot.slot); }}
                        className="px-3 py-1 text-sm text-red-400 border border-red-400 hover:bg-red-400 hover:text-black"
                      >
                        DELETE
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div 
                  className="w-full p-4 border-4 border-gray-800 cursor-pointer hover:border-gray-600"
                  style={{ fontFamily: "'Courier New', monospace" }}
                  onClick={() => handleImportSave(slot.slot)}
                >
                  <p className="text-gray-600">SLOT {slot.slot}: EMPTY</p>
                  <p className="text-gray-700 text-xs mt-1">Click to import save</p>
                </div>
              )}
            </div>
          ))}

          <button
            onClick={() => setMenuState("main")}
            className="mt-6 px-6 py-2 text-gray-400 border-2 border-gray-600 hover:border-white hover:text-white transition-colors"
            style={{ fontFamily: "'Courier New', monospace" }}
          >
            BACK
          </button>
        </div>
      )}

      {menuState === "settings" && (
        <div className="text-center space-y-4 w-80">
          <h2 
            className="text-2xl text-white mb-6"
            style={{ fontFamily: "'Courier New', monospace" }}
          >
            SETTINGS
          </h2>

          <div 
            className="text-gray-400 p-4 border-2 border-gray-700"
            style={{ fontFamily: "'Courier New', monospace" }}
          >
            <p className="text-white mb-2">CONTROLS</p>
            <p className="text-sm">WASD / Arrows: Move</p>
            <p className="text-sm">Z / Enter: Confirm</p>
            <p className="text-sm">X / Shift: Cancel</p>
          </div>

          <div 
            className="text-gray-500 p-4 border-2 border-gray-800"
            style={{ fontFamily: "'Courier New', monospace" }}
          >
            <p className="text-xs">Sound settings coming soon</p>
          </div>

          <button
            onClick={() => setMenuState("main")}
            className="mt-6 px-6 py-2 text-gray-400 border-2 border-gray-600 hover:border-white hover:text-white transition-colors"
            style={{ fontFamily: "'Courier New', monospace" }}
          >
            BACK
          </button>
        </div>
      )}

      <div className="mt-12 space-y-2">
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
      
      <p 
        className="absolute bottom-8 text-gray-600 text-xs"
        style={{ fontFamily: "'Courier New', monospace" }}
      >
        A journey through dimensions awaits...
      </p>
    </div>
  );
}
