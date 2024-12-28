import React, { useEffect, useState, useCallback } from 'react';
import { Car } from 'lucide-react';

interface Position {
  x: number;
  y: number;
}

interface Obstacle {
  x: number;
  y: number;
}

export function Game() {
  const [playerPos, setPlayerPos] = useState<Position>({ x: 50, y: 80 });
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [speed, setSpeed] = useState(5);
  const lanes = [20, 50, 80]; // Left, middle, right lanes

  const movePlayer = useCallback((direction: 'left' | 'right') => {
    if (gameOver) return;
    
    setPlayerPos(prev => {
      const currentLaneIndex = lanes.findIndex(lane => lane === prev.x);
      if (direction === 'left' && currentLaneIndex > 0) {
        return { ...prev, x: lanes[currentLaneIndex - 1] };
      }
      if (direction === 'right' && currentLaneIndex < lanes.length - 1) {
        return { ...prev, x: lanes[currentLaneIndex + 1] };
      }
      return prev;
    });
  }, [gameOver]);

  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') movePlayer('left');
    if (e.key === 'ArrowRight') movePlayer('right');
    if (e.key === 'Enter' && gameOver) resetGame();
  }, [movePlayer, gameOver]);

  const resetGame = () => {
    setPlayerPos({ x: 50, y: 80 });
    setObstacles([]);
    setScore(0);
    setGameOver(false);
    setSpeed(5);
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  useEffect(() => {
    if (gameOver) return;

    const gameLoop = setInterval(() => {
      // Move obstacles
      setObstacles(prev => {
        const newObstacles = prev
          .map(obs => ({ ...obs, y: obs.y + speed }))
          .filter(obs => obs.y < 100);

        // Add new obstacle
        if (Math.random() < 0.1 && newObstacles.length < 3) {
          const randomLane = lanes[Math.floor(Math.random() * lanes.length)];
          newObstacles.push({ x: randomLane, y: -10 });
        }

        return newObstacles;
      });

      // Check collisions
      obstacles.forEach(obs => {
        const collision = 
          Math.abs(obs.x - playerPos.x) < 10 && 
          Math.abs(obs.y - playerPos.y) < 10;
        
        if (collision) {
          setGameOver(true);
        }
      });

      // Update score
      setScore(prev => prev + 1);
      
      // Increase speed gradually
      if (score > 0 && score % 100 === 0) {
        setSpeed(prev => Math.min(prev + 1, 15));
      }
    }, 50);

    return () => clearInterval(gameLoop);
  }, [obstacles, playerPos, gameOver, score, speed]);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="relative w-[300px] h-[500px] bg-gray-800 rounded-lg overflow-hidden">
        {/* Road markings */}
        <div className="absolute inset-0 flex justify-between px-20">
          <div className="w-1 h-full bg-yellow-500 opacity-50" />
          <div className="w-1 h-full bg-yellow-500 opacity-50" />
        </div>
        
        {/* Score */}
        <div className="absolute top-4 left-4 text-white font-bold">
          Score: {score}
        </div>

        {/* Player car */}
        <div 
          className="absolute transition-all duration-100"
          style={{ 
            left: `${playerPos.x}%`, 
            top: `${playerPos.y}%`, 
            transform: 'translate(-50%, -50%)' 
          }}
        >
          <Car className="w-8 h-8 text-blue-500" />
        </div>

        {/* Obstacles */}
        {obstacles.map((obs, index) => (
          <div
            key={index}
            className="absolute"
            style={{
              left: `${obs.x}%`,
              top: `${obs.y}%`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <Car className="w-8 h-8 text-red-500" />
          </div>
        ))}

        {/* Game Over Screen */}
        {gameOver && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center">
            <h2 className="text-2xl text-white font-bold mb-4">Game Over!</h2>
            <p className="text-white mb-4">Final Score: {score}</p>
            <button
              onClick={resetGame}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Press Enter to Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}