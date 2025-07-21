import { useState, useEffect, useRef } from 'react';
import { GameState, Enemy, Position, Keys, WindowSize, EnemyDamageCooldowns } from '../types';
import { createEnemiesForLevel } from '../utils/enemyUtils';

// Clés pour le localStorage
const STORAGE_KEYS = {
  COMPLETED_LEVELS: 'game_completed_levels',
  CURRENT_LEVEL: 'game_current_level',
  HIGHEST_LEVEL: 'game_highest_level'
};

// Fonction pour charger la progression depuis le localStorage
const loadGameProgress = () => {
  try {
    const savedCompletedLevels = localStorage.getItem(STORAGE_KEYS.COMPLETED_LEVELS);
    const savedCurrentLevel = localStorage.getItem(STORAGE_KEYS.CURRENT_LEVEL);
    const savedHighestLevel = localStorage.getItem(STORAGE_KEYS.HIGHEST_LEVEL);
    
    return {
      completedLevels: savedCompletedLevels ? JSON.parse(savedCompletedLevels) : [],
      currentLevel: savedCurrentLevel ? parseInt(savedCurrentLevel, 10) : 1,
      highestLevel: savedHighestLevel ? parseInt(savedHighestLevel, 10) : 1
    };
  } catch (error) {
    console.warn('Erreur lors du chargement de la progression:', error);
    return {
      completedLevels: [],
      currentLevel: 1,
      highestLevel: 1
    };
  }
};

// Fonction pour sauvegarder la progression dans le localStorage
const saveGameProgress = (completedLevels: number[], currentLevel: number, highestLevel: number) => {
  try {
    localStorage.setItem(STORAGE_KEYS.COMPLETED_LEVELS, JSON.stringify(completedLevels));
    localStorage.setItem(STORAGE_KEYS.CURRENT_LEVEL, currentLevel.toString());
    localStorage.setItem(STORAGE_KEYS.HIGHEST_LEVEL, highestLevel.toString());
  } catch (error) {
    console.warn('Erreur lors de la sauvegarde de la progression:', error);
  }
};

export const useGameState = () => {
  // Charger la progression sauvegardée au démarrage
  const initialProgress = loadGameProgress();
  
  const [gameState, setGameState] = useState<GameState>('menu');
  const [currentLevel, setCurrentLevel] = useState(initialProgress.currentLevel);
  const [completedLevels, setCompletedLevels] = useState<number[]>(initialProgress.completedLevels);
  const [highestLevel, setHighestLevel] = useState(initialProgress.highestLevel);
  const [isVictory, setIsVictory] = useState(false);
  const [playerHp, setPlayerHp] = useState(10);
  const [position, setPosition] = useState<Position>({ x: 50, y: 50 });
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [enemyDamageCooldowns, setEnemyDamageCooldowns] = useState<EnemyDamageCooldowns>({});
  const [isPlayerDying, setIsPlayerDying] = useState(false);
  const [playerDeathFrame, setPlayerDeathFrame] = useState(0);
  const [isPlayerDisappeared, setIsPlayerDisappeared] = useState(false);
  const [gameStartTime, setGameStartTime] = useState(0);
  const [windowSize, setWindowSize] = useState<WindowSize>({ 
    width: window.innerWidth, 
    height: window.innerHeight 
  });

  // Références pour les valeurs actuelles
  const playerPositionRef = useRef<Position>({ x: 50, y: 50 });
  const enemiesRef = useRef<Enemy[]>([]);
  const enemyDamageCooldownsRef = useRef<EnemyDamageCooldowns>({});
  const isPlayerDisappearedRef = useRef(false);
  const enemiesInitialized = useRef(false);

  // Mettre à jour les références
  useEffect(() => {
    playerPositionRef.current = position;
  }, [position]);

  useEffect(() => {
    enemiesRef.current = enemies;
  }, [enemies]);

  useEffect(() => {
    enemyDamageCooldownsRef.current = enemyDamageCooldowns;
  }, [enemyDamageCooldowns]);

  useEffect(() => {
    isPlayerDisappearedRef.current = isPlayerDisappeared;
  }, [isPlayerDisappeared]);

  // Sauvegarder automatiquement la progression quand elle change
  useEffect(() => {
    saveGameProgress(completedLevels, currentLevel, highestLevel);
  }, [completedLevels, currentLevel, highestLevel]);

  // Écouter les changements de taille de fenêtre
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Vérifier la victoire
  useEffect(() => {
    if (gameState === 'playing' && enemies.length > 0) {
      const aliveEnemies = enemies.filter(enemy => enemy.isAlive || enemy.isDying);
      if (aliveEnemies.length === 0 && !isVictory) {
        setIsVictory(true);
        if (!completedLevels.includes(currentLevel)) {
          const newCompletedLevels = [...completedLevels, currentLevel];
          setCompletedLevels(newCompletedLevels);
          
          // Mettre à jour le niveau le plus élevé atteint
          const newHighestLevel = Math.max(highestLevel, currentLevel + 1);
          setHighestLevel(newHighestLevel);
          
          // Envoyer l'événement de completion si c'est le dernier niveau
          if (currentLevel === getMaxLevel()) {
            // Envoyer l'événement de completion du block
            const completionEvent = {
              type: 'BLOCK_COMPLETION',
              blockId: 'dungeon-crawler-game',
              completed: true,
              score: newCompletedLevels.length,
              maxScore: getMaxLevel(),
              timeSpent: Math.floor((Date.now() - gameStartTime) / 1000),
              data: {
                completedLevels: newCompletedLevels,
                finalLevel: currentLevel
              }
            };
            
            window.postMessage(completionEvent, '*');
            window.parent.postMessage(completionEvent, '*');
          }
        }
      }
    }
  }, [enemies, gameState, currentLevel, completedLevels, isVictory, highestLevel, gameStartTime]);

  // Initialisation des ennemis
  useEffect(() => {
    if (gameState === 'playing' && !enemiesInitialized.current && gameStartTime > 0) {
      const levelEnemies = createEnemiesForLevel(currentLevel);
      setEnemies(levelEnemies);
      enemiesInitialized.current = true;
    }
  }, [gameState, currentLevel, gameStartTime]);

  // Système d'apparition progressive des ennemis
  useEffect(() => {
    if (gameState !== 'playing' || gameStartTime === 0) return;
    
    const spawnCheckInterval = setInterval(() => {
      const currentTime = Date.now();
      const elapsedTime = currentTime - gameStartTime;
      
      setEnemies(prev => prev.map(enemy => {
        if (!enemy.hasSpawned && elapsedTime >= enemy.spawnTime) {
          return { ...enemy, hasSpawned: true };
        }
        return enemy;
      }));
    }, 100);

    return () => clearInterval(spawnCheckInterval);
  }, [gameState, gameStartTime]);

  // Fonction pour obtenir le niveau maximum du jeu (à adapter selon votre jeu)
  const getMaxLevel = () => {
    return 21; // Ajustez selon le nombre total de niveaux de votre jeu
  };

  // Fonctions de gestion du jeu
  const goToLevelSelect = () => {
    setGameState('levelSelect');
  };

  const startGame = (level: number = 1) => {
    enemiesInitialized.current = false;
    setCurrentLevel(level);
    setGameState('playing');
    setIsVictory(false);
    setPlayerHp(10);
    setPosition({ x: 50, y: 50 });
    setEnemies([]);
    setIsPlayerDying(false);
    setPlayerDeathFrame(0);
    setIsPlayerDisappeared(false);
    setEnemyDamageCooldowns({});
    setGameStartTime(Date.now());
  };

  const continueGame = () => {
    // Reprendre au niveau suivant ou au niveau actuel si pas encore terminé
    const levelToStart = completedLevels.includes(currentLevel) ? 
      Math.min(currentLevel + 1, getMaxLevel()) : currentLevel;
    startGame(levelToStart);
  };

  const returnToMenu = () => {
    setGameState('menu');
    setIsVictory(false);
    setPlayerHp(10);
    setPosition({ x: 50, y: 50 });
    setEnemies([]);
    enemiesInitialized.current = false;
    setEnemyDamageCooldowns({});
    setGameStartTime(0);
  };

  const returnToLevelSelect = () => {
    setGameState('levelSelect');
    setIsVictory(false);
    setPlayerHp(10);
    setPosition({ x: 50, y: 50 });
    setEnemies([]);
    enemiesInitialized.current = false;
    setEnemyDamageCooldowns({});
    setGameStartTime(0);
  };

  const isLevelUnlocked = (level: number) => {
    if (level === 1) return true;
    return completedLevels.includes(level - 1) || level <= highestLevel;
  };

  const resetGameProgress = () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.COMPLETED_LEVELS);
      localStorage.removeItem(STORAGE_KEYS.CURRENT_LEVEL);
      localStorage.removeItem(STORAGE_KEYS.HIGHEST_LEVEL);
      
      setCompletedLevels([]);
      setCurrentLevel(1);
      setHighestLevel(1);
      setGameState('menu');
    } catch (error) {
      console.warn('Erreur lors de la réinitialisation:', error);
    }
  };

  const getProgressPercentage = () => {
    return Math.round((completedLevels.length / getMaxLevel()) * 100);
  };

  const hasGameProgress = () => {
    return completedLevels.length > 0 || currentLevel > 1;
  };

  return {
    // États
    gameState,
    currentLevel,
    completedLevels,
    highestLevel,
    isVictory,
    playerHp,
    position,
    enemies,
    enemyDamageCooldowns,
    isPlayerDying,
    playerDeathFrame,
    isPlayerDisappeared,
    gameStartTime,
    windowSize,
    
    // Références
    playerPositionRef,
    enemiesRef,
    enemyDamageCooldownsRef,
    isPlayerDisappearedRef,
    
    // Setters
    setPlayerHp,
    setPosition,
    setEnemies,
    setEnemyDamageCooldowns,
    setIsPlayerDying,
    setPlayerDeathFrame,
    setIsPlayerDisappeared,
    
    // Fonctions
    goToLevelSelect,
    startGame,
    continueGame,
    returnToMenu,
    returnToLevelSelect,
    isLevelUnlocked,
    resetGameProgress,
    getProgressPercentage,
    hasGameProgress,
    getMaxLevel
  };
};