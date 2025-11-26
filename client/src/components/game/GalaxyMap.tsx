import { useState, useEffect } from "react";
import { useRPG } from "../../lib/stores/useRPG";
import { PLANET_DATA, REGIONS, getPlanetById } from "../../lib/data/planets";

interface GalaxyMapProps {
  onClose: () => void;
  onSelectPlanet: (planetId: number) => void;
}

export function GalaxyMap({ onClose, onSelectPlanet }: GalaxyMapProps) {
  const { planets, nebuliTotal } = useRPG();
  const [selectedRegion, setSelectedRegion] = useState(0);
  const [selectedPlanet, setSelectedPlanet] = useState(0);
  const [viewMode, setViewMode] = useState<"regions" | "planets">("regions");

  const currentRegion = REGIONS[selectedRegion];
  const regionPlanets = PLANET_DATA.filter(
    (p) => p.id >= currentRegion.planets[0] && p.id <= currentRegion.planets[1]
  );

  const getPlanetStatus = (planetId: number) => {
    const planet = planets.find((p) => p.id === planetId);
    return planet?.coreSealed ? "SEALED" : planet?.allEnemiesCleared ? "CLEARED" : "ACTIVE";
  };

  const getSealedCount = (regionIndex: number) => {
    const region = REGIONS[regionIndex];
    return planets.filter(
      (p) => p.id >= region.planets[0] && p.id <= region.planets[1] && p.coreSealed
    ).length;
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (viewMode === "regions") {
        if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
          setSelectedRegion((prev) => Math.max(0, prev - 1));
        } else if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") {
          setSelectedRegion((prev) => Math.min(REGIONS.length - 1, prev + 1));
        } else if (e.key === "z" || e.key === "Z" || e.key === "Enter") {
          setViewMode("planets");
          setSelectedPlanet(0);
        } else if (e.key === "x" || e.key === "X" || e.key === "Shift" || e.key === "Escape") {
          onClose();
        }
      } else {
        if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
          setSelectedPlanet((prev) => Math.max(0, prev - 1));
        } else if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") {
          setSelectedPlanet((prev) => Math.min(regionPlanets.length - 1, prev + 1));
        } else if (e.key === "z" || e.key === "Z" || e.key === "Enter") {
          const planet = regionPlanets[selectedPlanet];
          if (planet) {
            onSelectPlanet(planet.id);
          }
        } else if (e.key === "x" || e.key === "X" || e.key === "Shift" || e.key === "Escape") {
          setViewMode("regions");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [viewMode, selectedRegion, selectedPlanet, regionPlanets, onClose, onSelectPlanet]);

  const selectedPlanetData = viewMode === "planets" ? regionPlanets[selectedPlanet] : null;
  const selectedPlanetState = selectedPlanetData 
    ? planets.find((p) => p.id === selectedPlanetData.id) 
    : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50">
      <div className="w-full max-w-4xl p-6">
        <div className="text-center mb-6">
          <h1
            className="text-4xl text-yellow-400 mb-2"
            style={{ fontFamily: "'Courier New', monospace" }}
          >
            GALAXY MAP
          </h1>
          <p
            className="text-gray-400"
            style={{ fontFamily: "'Courier New', monospace" }}
          >
            {nebuliTotal}/50 Planets Sealed | 75 Nebuli Required
          </p>
        </div>

        <div className="flex gap-6">
          <div className="flex-1 border-2 border-gray-600 p-4 bg-gray-900">
            <h2
              className="text-xl text-white mb-4 border-b border-gray-600 pb-2"
              style={{ fontFamily: "'Courier New', monospace" }}
            >
              {viewMode === "regions" ? "REGIONS" : currentRegion.name.toUpperCase()}
            </h2>

            {viewMode === "regions" ? (
              <div className="space-y-2">
                {REGIONS.map((region, index) => {
                  const sealed = getSealedCount(index);
                  const total = region.planets[1] - region.planets[0] + 1;
                  return (
                    <div
                      key={region.name}
                      className={`p-3 cursor-pointer transition-all ${
                        index === selectedRegion
                          ? "bg-gray-700 border-l-4"
                          : "hover:bg-gray-800"
                      }`}
                      style={{
                        borderColor: index === selectedRegion ? region.color : "transparent",
                      }}
                      onClick={() => {
                        setSelectedRegion(index);
                        setViewMode("planets");
                        setSelectedPlanet(0);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: region.color }}
                          />
                          <span
                            className="text-white"
                            style={{ fontFamily: "'Courier New', monospace" }}
                          >
                            {region.name}
                          </span>
                        </div>
                        <span
                          className={`text-sm ${sealed === total ? "text-green-400" : "text-gray-400"}`}
                          style={{ fontFamily: "'Courier New', monospace" }}
                        >
                          {sealed}/{total}
                        </span>
                      </div>
                      <p
                        className="text-gray-500 text-sm mt-1 ml-7"
                        style={{ fontFamily: "'Courier New', monospace" }}
                      >
                        {region.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-1 max-h-80 overflow-y-auto">
                {regionPlanets.map((planet, index) => {
                  const status = getPlanetStatus(planet.id);
                  const planetState = planets.find((p) => p.id === planet.id);
                  return (
                    <div
                      key={planet.id}
                      className={`p-2 cursor-pointer transition-all flex items-center justify-between ${
                        index === selectedPlanet
                          ? "bg-gray-700 border-l-4"
                          : "hover:bg-gray-800"
                      }`}
                      style={{
                        borderColor: index === selectedPlanet ? planet.primaryColor : "transparent",
                      }}
                      onClick={() => {
                        setSelectedPlanet(index);
                        onSelectPlanet(planet.id);
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: planet.primaryColor }}
                        />
                        <span
                          className="text-white"
                          style={{ fontFamily: "'Courier New', monospace" }}
                        >
                          {planet.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span
                          className="text-gray-500 text-xs"
                          style={{ fontFamily: "'Courier New', monospace" }}
                        >
                          LV{planet.difficulty}
                        </span>
                        <span
                          className={`text-xs ${
                            status === "SEALED"
                              ? "text-green-400"
                              : status === "CLEARED"
                              ? "text-yellow-400"
                              : "text-gray-400"
                          }`}
                          style={{ fontFamily: "'Courier New', monospace" }}
                        >
                          {status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="w-72 border-2 border-gray-600 p-4 bg-gray-900">
            <h2
              className="text-xl text-white mb-4 border-b border-gray-600 pb-2"
              style={{ fontFamily: "'Courier New', monospace" }}
            >
              PLANET INFO
            </h2>

            {selectedPlanetData ? (
              <div className="space-y-4">
                <div
                  className="w-full h-24 rounded flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${selectedPlanetData.primaryColor}, ${selectedPlanetData.secondaryColor})`,
                  }}
                >
                  <span
                    className="text-white text-2xl font-bold drop-shadow-lg"
                    style={{ fontFamily: "'Courier New', monospace" }}
                  >
                    {selectedPlanetData.name}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400" style={{ fontFamily: "'Courier New', monospace" }}>
                      Biome:
                    </span>
                    <span className="text-white" style={{ fontFamily: "'Courier New', monospace" }}>
                      {selectedPlanetData.biome}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400" style={{ fontFamily: "'Courier New', monospace" }}>
                      Difficulty:
                    </span>
                    <span
                      className={`${
                        selectedPlanetData.difficulty <= 2
                          ? "text-green-400"
                          : selectedPlanetData.difficulty <= 3
                          ? "text-yellow-400"
                          : selectedPlanetData.difficulty <= 4
                          ? "text-orange-400"
                          : "text-red-400"
                      }`}
                      style={{ fontFamily: "'Courier New', monospace" }}
                    >
                      {"★".repeat(selectedPlanetData.difficulty)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400" style={{ fontFamily: "'Courier New', monospace" }}>
                      Status:
                    </span>
                    <span
                      className={`${
                        getPlanetStatus(selectedPlanetData.id) === "SEALED"
                          ? "text-green-400"
                          : getPlanetStatus(selectedPlanetData.id) === "CLEARED"
                          ? "text-yellow-400"
                          : "text-white"
                      }`}
                      style={{ fontFamily: "'Courier New', monospace" }}
                    >
                      {getPlanetStatus(selectedPlanetData.id)}
                    </span>
                  </div>
                  {selectedPlanetState && (
                    <div className="flex justify-between">
                      <span className="text-gray-400" style={{ fontFamily: "'Courier New', monospace" }}>
                        Shards:
                      </span>
                      <span className="text-purple-400" style={{ fontFamily: "'Courier New', monospace" }}>
                        {selectedPlanetState.shardsCollected}/{selectedPlanetState.totalShards}
                      </span>
                    </div>
                  )}
                </div>

                <p
                  className="text-gray-300 text-sm italic"
                  style={{ fontFamily: "'Courier New', monospace" }}
                >
                  "{selectedPlanetData.description}"
                </p>

                <div className="border-t border-gray-600 pt-3">
                  <p
                    className="text-gray-400 text-xs mb-2"
                    style={{ fontFamily: "'Courier New', monospace" }}
                  >
                    ENEMIES:
                  </p>
                  <div className="space-y-1">
                    {selectedPlanetData.enemies.map((enemy) => (
                      <div key={enemy.name} className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: enemy.color }}
                        />
                        <span
                          className="text-gray-300 text-xs"
                          style={{ fontFamily: "'Courier New', monospace" }}
                        >
                          {enemy.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p
                  className="text-gray-500"
                  style={{ fontFamily: "'Courier New', monospace" }}
                >
                  Select a region to view planets
                </p>
              </div>
            )}
          </div>
        </div>

        <div
          className="text-center mt-6 text-gray-500"
          style={{ fontFamily: "'Courier New', monospace" }}
        >
          {viewMode === "regions" ? (
            <>↑↓: Navigate | Z/Enter: Select Region | X/Esc: Close</>
          ) : (
            <>↑↓: Navigate | Z/Enter: Travel | X/Esc: Back to Regions</>
          )}
        </div>
      </div>
    </div>
  );
}
