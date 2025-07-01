import { useState, useEffect, useRef, useCallback } from 'react';
import { Position, GameState } from '../types';
import { usePlayerMovement } from './usePlayerMovement';
import { useEnemySystem } from './useEnemySystem';
import { useBulletSystem } from './useBulletSystem';
import { useAttackSystem } from './useAttackSystem';

export const useGame = () => {
    // Configuration du jeu
  const [mapDimensions, setMapDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  const PLAYER_SPEED = 0.5; // Vitesse optimisée pour éviter les problèmes de collision
  
  // Fonction de collision entre deux entités
  const checkCollision = (pos1: {x: number, y: number}, pos2: {x: number, y: number}, minDistance: number = 3) => {
    const deltaX = pos1.x - pos2.x;
    const deltaY = pos1.y - pos2.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    return distance < minDistance;
  };
  
  // États du jeu
  const [gameState, setGameState] = useState<GameState>('menu');
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [playerHealth, setPlayerHealth] = useState(10);
  const [gameTime, setGameTime] = useState(0);
  const [playerDirection, setPlayerDirection] = useState(0);
  
  // Position initiale du joueur (centre de l'écran en pourcentages)
  const initialPlayerPos: Position = { 
    x: 50, // 50% de la largeur
    y: 50  // 50% de la hauteur
  };

  // Terminer le jeu
  const endGame = useCallback(() => {
    setGameState('gameover');
  }, []);

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

  // Hook du système d'ennemis
  const { enemies: enemySystemEnemies, setEnemies: setEnemySystemEnemies, enemiesRef: enemySystemRef, updatePlayerPosition } = useEnemySystem(
    initialPlayerPos, // Utiliser la position initiale pour l'instant
    gameState,
    mapDimensions.width,
    mapDimensions.height,
    level,
    () => takeDamage(1) // Dégât de base, les dégâts spécifiques sont gérés dans useEnemySystem
  );

  // Hook de mouvement du joueur
  const { playerPosition, movePlayer, resetPlayer } = usePlayerMovement(
    initialPlayerPos,
    PLAYER_SPEED,
    mapDimensions.width,
    mapDimensions.height,
    gameState,
    enemySystemEnemies
  );

  // Mettre à jour la position du joueur dans le système d'ennemis
  useEffect(() => {
    updatePlayerPosition(playerPosition);
  }, [playerPosition, updatePlayerPosition]);

  // Hook du système de balles
  const { bullets, shootBullet } = useBulletSystem(
    gameState,
    mapDimensions.width,
    mapDimensions.height,
    enemySystemEnemies,
    setEnemySystemEnemies,
    enemySystemRef
  );

  // Hook du système d'attaque
  const { isAttacking, attackFrame, triggerAttack } = useAttackSystem(
    gameState,
    playerPosition,
    playerDirection,
    enemySystemEnemies,
    setEnemySystemEnemies
  );

  // Démarrer le jeu
  const startGame = useCallback(() => {
    setGameState('playing');
    setScore(0);
    setLevel(1);
    setPlayerHealth(10);
    setGameTime(0);
    resetPlayer();
  }, [resetPlayer]);

  // Retourner au menu
  const backToMenu = useCallback(() => {
    setGameState('menu');
  }, []);

  // Tirer vers une position
  const handleShoot = useCallback((targetPos: Position) => {
    if (gameState === 'playing') {
      shootBullet(playerPosition, targetPos);
    }
  }, [gameState, playerPosition, shootBullet]);

  // Augmenter le score
  const addScore = useCallback((points: number) => {
    setScore(prev => prev + points);
  }, []);

  // Vérifier la victoire (tous les ennemis morts)
  useEffect(() => {
    if (gameState === 'playing' && enemySystemEnemies.length > 0) {
      const aliveEnemies = enemySystemEnemies.filter((enemy: any) => enemy.isAlive || enemy.isDying);
      if (aliveEnemies.length === 0) {
        // Niveau terminé !
        setGameState('victory');
      }
    }
  }, [enemySystemEnemies, gameState]);

  // Nettoyer les ennemis morts
  useEffect(() => {
    const now = Date.now();
    const filteredEnemies = enemySystemEnemies.filter((enemy: any) => {
      if (enemy.isDying && !enemy.isAlive) {
        return now - (enemy.lastMoveTime || 0) < 2000;
      }
      return true;
    });

    if (filteredEnemies.length !== enemySystemEnemies.length) {
      setEnemySystemEnemies(filteredEnemies);
      enemySystemRef.current = filteredEnemies;
    }
  }, [enemySystemEnemies, setEnemySystemEnemies, enemySystemRef]);

  // Timer du jeu
  useEffect(() => {
    if (gameState !== 'playing') return;

    const interval = setInterval(() => {
      setGameTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState]);

  // Mettre à jour les dimensions de la carte quand la fenêtre change de taille
  useEffect(() => {
    const handleResize = () => {
      setMapDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    enemies: enemySystemEnemies,
    bullets,
    
    // Configuration
    mapWidth: mapDimensions.width,
    mapHeight: mapDimensions.height,
    
    // Actions du jeu
    startGame,
    endGame,
    backToMenu,
    movePlayer,
    handleShoot,
    addScore,
    triggerAttack,
    setPlayerDirection,
    
    // États d'attaque
    isAttacking,
    attackFrame,
    
    // Utilitaires
    takeDamage
  };
};