import { useState, useEffect, useCallback } from "react";

interface NameInputProps {
  onComplete: (name: string) => void;
}

export function NameInput({ onComplete }: NameInputProps) {
  const [name, setName] = useState("");
  const [confirming, setConfirming] = useState(false);
  const maxLength = 12;

  const handleConfirm = useCallback(() => {
    if (name.trim().length === 0) return;
    
    if (!confirming) {
      setConfirming(true);
    } else {
      onComplete(name.trim());
    }
  }, [name, confirming, onComplete]);

  const handleCancel = useCallback(() => {
    if (confirming) {
      setConfirming(false);
    }
  }, [confirming]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (confirming) {
        if (e.key === "Enter" || e.key === "z" || e.key === "Z") {
          handleConfirm();
        } else if (e.key === "Shift" || e.key === "x" || e.key === "X") {
          handleCancel();
        }
        return;
      }

      if (e.key === "Backspace") {
        setName((prev) => prev.slice(0, -1));
      } else if (e.key === "Enter") {
        handleConfirm();
      } else if (e.key.length === 1 && name.length < maxLength) {
        const char = e.key;
        if (/^[a-zA-Z0-9 ]$/.test(char)) {
          setName((prev) => prev + char.toUpperCase());
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [name, confirming, handleConfirm, handleCancel]);

  return (
    <div className="w-full h-full bg-black flex flex-col items-center justify-center select-none">
      {!confirming ? (
        <div className="text-center">
          <p
            className="text-2xl text-white mb-8"
          >
            Name the fallen human.
          </p>

          <div 
            className="w-80 mx-auto border-4 border-white p-4 mb-8"
            style={{ minHeight: "60px" }}
          >
            <p
              className="text-3xl text-white text-center"
            >
              {name}
              <span className="animate-pulse">_</span>
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleConfirm}
              disabled={name.trim().length === 0}
              className={`block w-48 mx-auto py-2 text-xl border-4 transition-colors cursor-pointer ${
                name.trim().length === 0
                  ? "text-gray-600 border-gray-600"
                  : "text-white border-white hover:bg-white hover:text-black"
              }`}
            >
              Done
            </button>
          </div>

          <p
            className="text-gray-500 text-sm mt-12"
          >
            Type to enter name, Backspace to delete
          </p>
        </div>
      ) : (
        <div className="text-center">
          <p
            className="text-2xl text-white mb-4"
          >
            Is this name correct?
          </p>
          
          <p
            className="text-4xl text-yellow-400 mb-12"
            style={{ 
              textShadow: "0 0 10px #ff0, 0 0 20px #ff0"
            }}
          >
            {name}
          </p>

          <div className="flex gap-8 justify-center">
            <button
              onClick={handleConfirm}
              className="w-32 py-2 text-xl text-white border-4 border-white hover:bg-white hover:text-black transition-colors cursor-pointer"
            >
              Yes
            </button>
            <button
              onClick={handleCancel}
              className="w-32 py-2 text-xl text-white border-4 border-white hover:bg-white hover:text-black transition-colors cursor-pointer"
            >
              No
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
