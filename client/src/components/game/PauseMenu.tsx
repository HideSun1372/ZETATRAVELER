import { useState } from "react";
import { useRPG } from "@/lib/stores/useRPG";

interface PauseMenuProps {
  onClose: () => void;
  onReturnToHub?: () => void;
  showReturnToHub?: boolean;
}

export function PauseMenu({ onClose, onReturnToHub, showReturnToHub = false }: PauseMenuProps) {
  const {
    saveGame,
    saveSlots,
    playerName,
    level,
    nebuliTotal,
    currentRoute,
    hp,
    maxHp,
    hopeBonus,
    gold,
    xp,
    xpToNextLevel,
    atk,
    def,
    hope,
    totalKills,
    totalSpares,
  } = useRPG();

  const [menuState, setMenuState] = useState<"main" | "save" | "stats">("main");
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState(0);

  const handleSave = (slot: number) => {
    saveGame(slot);
    setSaveMessage(`Saved to Slot ${slot}!`);
    setTimeout(() => setSaveMessage(null), 2000);
  };

  const formatDate = (slotData: typeof saveSlots[0]) => {
    const timestamp = localStorage.getItem(`zetatraveler_save_${slotData.slot}_timestamp`);
    if (!timestamp) return "";
    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return "";
    }
  };

  const getRouteColor = () => {
    switch (currentRoute) {
      case 'pacifist': return 'text-green-400';
      case 'genocide': return 'text-red-400';
      default: return 'text-yellow-400';
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div 
        className="bg-gray-900 border-4 border-white p-6 min-w-[400px]"
        style={{ fontFamily: "'Courier New', monospace" }}
      >
        {menuState === "main" && (
          <>
            <h2 className="text-2xl text-white text-center mb-6">PAUSED</h2>
            
            <div className="space-y-3">
              <button
                onClick={onClose}
                className="w-full py-2 text-white border-2 border-white hover:bg-white hover:text-black transition-colors"
              >
                RESUME
              </button>
              
              <button
                onClick={() => setMenuState("save")}
                className="w-full py-2 text-white border-2 border-white hover:bg-white hover:text-black transition-colors"
              >
                SAVE GAME
              </button>
              
              <button
                onClick={() => setMenuState("stats")}
                className="w-full py-2 text-white border-2 border-white hover:bg-white hover:text-black transition-colors"
              >
                VIEW STATS
              </button>
              
              {showReturnToHub && onReturnToHub && (
                <button
                  onClick={onReturnToHub}
                  className="w-full py-2 text-yellow-400 border-2 border-yellow-400 hover:bg-yellow-400 hover:text-black transition-colors"
                >
                  RETURN TO HUB
                </button>
              )}
            </div>
          </>
        )}

        {menuState === "save" && (
          <>
            <h2 className="text-2xl text-white text-center mb-4">SAVE GAME</h2>
            
            {saveMessage && (
              <p className="text-green-400 text-center mb-4 animate-pulse">{saveMessage}</p>
            )}
            
            <div className="space-y-3">
              {[1, 2, 3].map((slot) => {
                const slotData = saveSlots.find(s => s.slot === slot);
                const hasData = slotData?.data !== null;
                
                return (
                  <div
                    key={slot}
                    className={`p-3 border-2 cursor-pointer transition-colors ${
                      selectedSlot === slot 
                        ? "border-yellow-400 bg-yellow-900/20" 
                        : "border-gray-600 hover:border-white"
                    }`}
                    onClick={() => setSelectedSlot(slot)}
                    onDoubleClick={() => handleSave(slot)}
                  >
                    <div className="flex justify-between">
                      <span className="text-white">SLOT {slot}</span>
                      {hasData && (
                        <span className="text-gray-500 text-xs">{formatDate(slotData!)}</span>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm">
                      {hasData ? `${playerName} - LV ${level}` : "Empty"}
                    </p>
                    
                    {selectedSlot === slot && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleSave(slot); }}
                        className="mt-2 w-full py-1 text-sm text-green-400 border border-green-400 hover:bg-green-400 hover:text-black"
                      >
                        {hasData ? "OVERWRITE" : "SAVE HERE"}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            
            <button
              onClick={() => setMenuState("main")}
              className="w-full mt-4 py-2 text-gray-400 border-2 border-gray-600 hover:border-white hover:text-white transition-colors"
            >
              BACK
            </button>
          </>
        )}

        {menuState === "stats" && (
          <>
            <h2 className="text-2xl text-white text-center mb-4">STATS</h2>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between border-b border-gray-700 pb-2">
                <span className="text-gray-400">Name:</span>
                <span className="text-white">{playerName}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-400">Level:</span>
                <span className="text-white">{level}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-400">XP:</span>
                <span className="text-white">{level >= 100 ? "MAX" : `${xp}/${xpToNextLevel}`}</span>
              </div>
              
              <div className="flex justify-between border-b border-gray-700 pb-2">
                <span className="text-gray-400">HP:</span>
                <span className="text-white">{hp}/{maxHp + hopeBonus.hp}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-red-400">ATK:</span>
                <span className="text-white">{atk}</span>
              </div>
              
              <div className="flex justify-between border-b border-gray-700 pb-2">
                <span className="text-blue-400">DEF:</span>
                <span className="text-white">{def + hopeBonus.def}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-yellow-400">Gold:</span>
                <span className="text-white">{gold}</span>
              </div>
              
              <div className="flex justify-between border-b border-gray-700 pb-2">
                <span className="text-cyan-400">Hope:</span>
                <span className="text-white">{hope}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-purple-400">Nebuli Cores:</span>
                <span className="text-white">{nebuliTotal}/50</span>
              </div>
              
              <div className="flex justify-between border-b border-gray-700 pb-2">
                <span className={getRouteColor()}>Route:</span>
                <span className={getRouteColor()}>{currentRoute.toUpperCase()}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-400">Enemies Killed:</span>
                <span className="text-red-300">{totalKills}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-400">Enemies Spared:</span>
                <span className="text-green-300">{totalSpares}</span>
              </div>
            </div>
            
            <button
              onClick={() => setMenuState("main")}
              className="w-full mt-4 py-2 text-gray-400 border-2 border-gray-600 hover:border-white hover:text-white transition-colors"
            >
              BACK
            </button>
          </>
        )}
      </div>
    </div>
  );
}
