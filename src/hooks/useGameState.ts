import { useState, useEffect, useRef } from 'react';
import { GameState, Enemy, Position, Keys, WindowSize, EnemyDamageCooldowns } from '../types';
import { createEnemiesForLevel } from '../utils/enemyUtils';

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>('menu');
  const [currentLevel, setCurrentLevel] = useState(1);
  const [completedLevels, setCompletedLevels] = useState<number[]>([]);
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
          setCompletedLevels(prev => [...prev, currentLevel]);
        }
      }
    }
  }, [enemies, gameState, currentLevel, completedLevels, isVictory]);

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
    return completedLevels.includes(level - 1);
  };

  return {
    // États
    gameState,
    currentLevel,
    completedLevels,
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
    returnToMenu,
    returnToLevelSelect,
    isLevelUnlocked
  };
}; 