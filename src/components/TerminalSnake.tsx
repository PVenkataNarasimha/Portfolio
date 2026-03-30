import React, { useState, useEffect, useCallback, useRef } from 'react';
import './TerminalSnake.css';

interface Point {
  x: number;
  y: number;
}

interface TerminalSnakeProps {
  onExit: () => void;
}

const GRID_SIZE = 20;
const INITIAL_SNAKE: Point[] = [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
  { x: 10, y: 12 },
];
const INITIAL_DIRECTION = { x: 0, y: -1 };

const TerminalSnake: React.FC<TerminalSnakeProps> = ({ onExit }) => {
  const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Point>({ x: 5, y: 5 });
  const [direction, setDirection] = useState<Point>(INITIAL_DIRECTION);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const gameLoopRef = useRef<number | null>(null);

  const generateFood = useCallback((currentSnake: Point[]) => {
    let newFood: Point;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      const hitSnake = currentSnake.some(p => p.x === newFood.x && p.y === newFood.y);
      if (!hitSnake) break;
    }
    return newFood;
  }, []);

  const moveSnake = useCallback(() => {
    setSnake(prevSnake => {
      const head = prevSnake[0];
      const newHead = {
        x: (head.x + direction.x + GRID_SIZE) % GRID_SIZE,
        y: (head.y + direction.y + GRID_SIZE) % GRID_SIZE,
      };

      // Check collision with self
      if (prevSnake.some(p => p.x === newHead.x && p.y === newHead.y)) {
        setIsGameOver(true);
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      // Check collision with food
      if (newHead.x === food.x && newHead.y === food.y) {
        setScore(s => s + 10);
        setFood(generateFood(newSnake));
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [direction, food, generateFood]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (direction.y === 0) setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (direction.y === 0) setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (direction.x === 0) setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (direction.x === 0) setDirection({ x: 1, y: 0 });
          break;
        case 'Escape':
        case 'q':
        case 'Q':
          onExit();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction, onExit]);

  useEffect(() => {
    if (isGameOver) {
      if (score > highScore) setHighScore(score);
      return;
    }

    const interval = window.setInterval(moveSnake, 150);
    gameLoopRef.current = interval;

    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [isGameOver, moveSnake, score, highScore]);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setFood({ x: 5, y: 5 });
    setDirection(INITIAL_DIRECTION);
    setIsGameOver(false);
    setScore(0);
  };

  const renderGrid = () => {
    const grid = [];
    for (let y = 0; y < GRID_SIZE; y++) {
      let row = '';
      for (let x = 0; x < GRID_SIZE; x++) {
        const isSnakeHead = snake[0].x === x && snake[0].y === y;
        const isSnakeBody = snake.slice(1).some(p => p.x === x && p.y === y);
        const isFood = food.x === x && food.y === y;

        if (isSnakeHead) row += 'H';
        else if (isSnakeBody) row += 'O';
        else if (isFood) row += '@';
        else row += '·';
      }
      grid.push(<div key={y} className="snake-row">{row}</div>);
    }
    return grid;
  };

  return (
    <div className="terminal-snake-game">
      <div className="snake-header">
        <span className="snake-title">TERMINAL_SNAKE_V1.0</span>
        <span className="snake-score">SCORE: {score.toString().padStart(4, '0')}</span>
        <span className="snake-high">HI: {highScore.toString().padStart(4, '0')}</span>
      </div>
      
      <div className="snake-grid-container">
        {isGameOver ? (
          <div className="game-over-overlay">
            <div className="game-over-text">CRITICAL_SYSTEM_FAILURE</div>
            <div className="game-over-sub">SNAKE_PROCESS_TERMINATED</div>
            <button className="snake-btn" onClick={resetGame}>REBOOT (R)</button>
            <button className="snake-btn secondary" onClick={onExit}>EXIT (ESC)</button>
          </div>
        ) : (
          <div className="snake-grid">
            {renderGrid()}
          </div>
        )}
      </div>

      <div className="snake-footer">
        [Arrows/WASD] to Move | [Esc/Q] to Exit
      </div>
    </div>
  );
};

export default TerminalSnake;
