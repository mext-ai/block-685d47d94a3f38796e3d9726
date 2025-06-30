import { useState, useEffect, useRef, useCallback } from 'react';
import { Position, GameState } from '../types';
import { usePlayerMovement } from './usePlayerMovement';
import { useEnemySystem } from './useEnemySystem';
import { useBulletSystem } from './useBulletSystem';

interface Enemy {
  id: number;
  x: number;
  y: number;
  hp: number;
  isAlive: boolean;
  isDying: boolean;
  lastMoveTime: number;
  direction: number;
}

export const useGame = () => {
  // Configuration du jeu
  const MAP_WIDTH = 800;
  const MAP_HEIGHT = 600;
  const PLAYER_SPEED = 5;

  // États du jeu
  const [gameState, setGameState] = useState<GameState>('menu');
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [playerHealth, setPlayerHealth] = useState(100);
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [gameTime, setGameTime] = useState(0);

  // Références pour les hooks
  const enemiesRef = useRef<Enemy[]>([]);
  
  // Position initiale du joueur
  const initialPlayerPos: Position = { 
    x: MAP_WIDTH / 2, 
    y: MAP_HEIGHT / 2 
  };

  // Hook de mouvement du joueur
  const { playerPosition, movePlayer, resetPlayer } = usePlayerMovement(
    initialPlayerPos,
    PLAYER_SPEED,
    MAP_WIDTH,
    MAP_HEIGHT,
    gameState
  );

  // Hook du système d'ennemis
  const { spawnEnemy, checkPlayerCollision } = useEnemySystem(
    gameState,
    playerPosition,
    MAP_WIDTH,
    MAP_HEIGHT,
    enemies,
    setEnemies,
    enemiesRef
  );

  // Hook du système de balles
  const { bullets, shootBullet } = useBulletSystem(
    gameState,
    MAP_WIDTH,
    MAP_HEIGHT,
    enemies,
    setEnemies,
    enemiesRef
  );

  // Démarrer le jeu
  const startGame = useCallback(() => {
    setGameState('playing');
    setScore(0);
    setLevel(1);
    setPlayerHealth(100);
    setEnemies([]);
    setGameTime(0);
    enemiesRef.current = [];
    resetPlayer();
  }, [resetPlayer]);

  // Terminer le jeu
  const endGame = useCallback(() => {
    setGameState('gameover');
  }, []);

  // Retourner au menu
  const backToMenu = useCallback(() => {
    setGameState('menu');
    setEnemies([]);
    enemiesRef.current = [];
  }, []);

  // Tirer vers une position
  const handleShoot = useCallback((targetPos: Position) => {
    if (gameState === 'playing') {
      shootBullet(playerPosition, targetPos);
    }
  }, [gameState, playerPosition, shootBullet]);

  // Gérer les dégâts au joueur
  const takeDamage = useCallback((damage: number) => {
    setPlayerHealth(prev => {
      const newHealth = Math.max(0, prev - damage);
      if (newHealth <= 0) {
        endGame();
      }
      return newHealth;
    });
  }, [endGame]);

  // Augmenter le score
  const addScore = useCallback((points: number) => {
    setScore(prev => prev + points);
  }, []);

  // Vérifier les collisions avec le joueur
  useEffect(() => {
    if (gameState !== 'playing') return;

    const checkCollisions = () => {
      const collision = checkPlayerCollision();
      if (collision) {
        takeDamage(10);
      }
    };

    const interval = setInterval(checkCollisions, 50);
    return () => clearInterval(interval);
  }, [gameState, checkPlayerCollision, takeDamage]);

  // Compter les ennemis tués pour le score
  useEffect(() => {
    const aliveEnemies = enemies.filter(enemy => enemy.isAlive).length;
    const totalEnemies = enemies.length;
    const killedEnemies = totalEnemies - aliveEnemies;
    
    // Nettoyer les ennemis morts depuis plus de 2 secondes
    const now = Date.now();
    const filteredEnemies = enemies.filter(enemy => {
      if (enemy.isDying && !enemy.isAlive) {
        return now - enemy.lastMoveTime < 2000;
      }
      return true;
    });

    if (filteredEnemies.length !== enemies.length) {
      setEnemies(filteredEnemies);
      enemiesRef.current = filteredEnemies;
    }
  }, [enemies]);

  // Timer du jeu
  useEffect(() => {
    if (gameState !== 'playing') return;

    const interval = setInterval(() => {
      setGameTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState]);

  // Augmenter la difficulté avec le temps
  useEffect(() => {
    if (gameState !== 'playing') return;

    const newLevel = Math.floor(gameTime / 30) + 1;
    if (newLevel !== level) {
      setLevel(newLevel);
    }
  }, [gameTime, level, gameState]);

  return {
    // États du jeu
    gameState,
    score,
    level,
    playerHealth,
    gameTime,
    
    // Entités du jeu
    playerPosition,
    enemies,
    bullets,
    
    // Configuration
    mapWidth: MAP_WIDTH,
    mapHeight: MAP_HEIGHT,
    
    // Actions du jeu
    startGame,
    endGame,
    backToMenu,
    movePlayer,
    handleShoot,
    addScore,
    
    // Utilitaires
    takeDamage
  };
};