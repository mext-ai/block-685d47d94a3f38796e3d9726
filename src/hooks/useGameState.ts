import { useState } from 'react';
import { GameState } from '../types';

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>('menu');
  const [currentLevel, setCurrentLevel] = useState(1);
  const [completedLevels, setCompletedLevels] = useState<number[]>([]);
  const [isVictory, setIsVictory] = useState(false);

  const goToLevelSelect = () => {
    setGameState('levelSelect');
  };

  const startGame = (level: number = 1) => {
    setCurrentLevel(level);
    setGameState('playing');
    setIsVictory(false);
  };

  const returnToMenu = () => {
    setGameState('menu');
    setIsVictory(false);
  };

  const returnToLevelSelect = () => {
    setGameState('levelSelect');
    setIsVictory(false);
  };

  const isLevelUnlocked = (level: number) => {
    if (level === 1) return true;
    return completedLevels.includes(level - 1);
  };

  const markLevelCompleted = (level: number) => {
    if (!completedLevels.includes(level)) {
      setCompletedLevels(prev => [...prev, level]);
    }
  };

  return {
    gameState,
    setGameState,
    currentLevel,
    setCurrentLevel,
    completedLevels,
    isVictory,
    setIsVictory,
    goToLevelSelect,
    startGame,
    returnToMenu,
    returnToLevelSelect,
    isLevelUnlocked,
    markLevelCompleted
  };
}; 