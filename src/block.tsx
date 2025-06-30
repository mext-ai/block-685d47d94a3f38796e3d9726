import React, { useEffect, useState, useRef } from 'react';
import { BlockProps } from './types';
import { 
  backgroundImageUrl, 
  level2BackgroundUrl, 
} from './constants';

// Hooks personnalisés
import { useGameState } from './hooks/useGameState';
import { usePlayer } from './hooks/usePlayer';
import { useEnemies } from './hooks/useEnemies';
import { useAudio } from './hooks/useAudio';
import { useResponsive } from './hooks/useResponsive';

// Composants
import { MainMenu } from './components/MainMenu';
import { LevelSelect } from './components/LevelSelect';
import { GameUI } from './components/GameUI';

// Logique de jeu
import { checkCollision, checkEnemyAttackHit, isEnemyInAttackDirection } from './gameLogic/collisionDetection';
import { updatePlayerPosition, getPlayerDirection, isPlayerWalking } from './gameLogic/playerMovement';

const Block: React.FC<BlockProps> = () => {
  // États pour les boutons du menu
  const [isPlayButtonHovered, setIsPlayButtonHovered] = useState(false);
  const [isLevel1ButtonHovered, setIsLevel1ButtonHovered] = useState(false);
  const [isLevel2ButtonHovered, setIsLevel2ButtonHovered] = useState(false);
  const [isLevel3ButtonHovered, setIsLevel3ButtonHovered] = useState(false);
  const [gameStartTime, setGameStartTime] = useState(0);

  // Hooks personnalisés
  const gameState = useGameState();
  const player = usePlayer();
  const enemies = useEnemies();
  const audio = useAudio();
  const responsive = useResponsive();

  // Références
  const gameLoopRef = useRef<number>();

  // Gestion des événements clavier
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
          player.setKeys(prev => ({ ...prev, up: true }));
          break;
        case 'ArrowDown':
        case 'KeyS':
          player.setKeys(prev => ({ ...prev, down: true }));
          break;
        case 'ArrowLeft':
        case 'KeyA':
          player.setKeys(prev => ({ ...prev, left: true }));
          break;
        case 'ArrowRight':
        case 'KeyD':
          player.setKeys(prev => ({ ...prev, right: true }));
          break;
        case 'Space':
          player.setKeys(prev => ({ ...prev, space: true }));
          break;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
          player.setKeys(prev => ({ ...prev, up: false }));
          break;
        case 'ArrowDown':
        case 'KeyS':
          player.setKeys(prev => ({ ...prev, down: false }));
          break;
        case 'ArrowLeft':
        case 'KeyA':
          player.setKeys(prev => ({ ...prev, left: false }));
          break;
        case 'ArrowRight':
        case 'KeyD':
          player.setKeys(prev => ({ ...prev, right: false }));
          break;
        case 'Space':
          player.setKeys(prev => ({ ...prev, space: false }));
          break;
      }
    };

    if (gameState.gameState === 'playing') {
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState.gameState, player.setKeys]);

  // Gestion de la musique selon l'état du jeu
  useEffect(() => {
    if (!audio.backgroundMusic) return;

    const playMusic = async () => {
      if ((gameState.gameState === 'menu' || gameState.gameState === 'levelSelect') && audio.isSoundEnabled) {
        try {
          audio.backgroundMusic!.currentTime = 0;
          await audio.backgroundMusic!.play();
        } catch (error) {
          console.log('Erreur lecture audio:', error);
        }
      } else {
        audio.backgroundMusic!.pause();
      }
    };

    playMusic();
  }, [gameState.gameState, audio.isSoundEnabled, audio.backgroundMusic]);

  // Gestion de la musique de jeu
  useEffect(() => {
    if (gameState.gameState === 'playing' && gameState.currentLevel === 1) {
      if (audio.gameMusic && audio.isSoundEnabled) {
        audio.gameMusic.currentTime = 0;
        audio.gameMusic.play().catch(error => {
          console.log('Erreur lecture musique de jeu:', error);
        });
      }
    } else if (audio.gameMusic) {
      audio.gameMusic.pause();
    }
  }, [gameState.gameState, gameState.currentLevel, audio.gameMusic, audio.isSoundEnabled]);

  // Gestion des événements de clic
  const handlePlayButtonClick = () => {
    audio.forceStartMusic();
    gameState.goToLevelSelect();
  };

  const handleLevel1ButtonClick = () => {
    startGame(1);
  };

  const handleLevel2ButtonClick = () => {
    if (gameState.isLevelUnlocked(2)) {
      startGame(2);
    }
  };

  const handleLevel3ButtonClick = () => {
    if (gameState.isLevelUnlocked(3)) {
      startGame(3);
    }
  };

  const startGame = (level: number) => {
    gameState.startGame(level);
    player.resetPlayer();
    enemies.resetEnemies();
    setGameStartTime(Date.now());
    
    // Initialiser les ennemis selon le niveau
    if (level === 1) {
      enemies.setEnemies(enemies.createLevel1Enemies());
    } else if (level === 2) {
      enemies.setEnemies(enemies.createLevel2Enemies());
    }
    
    enemies.enemiesInitialized.current = true;
    enemies.enemiesRef.current = enemies.enemies;
  };

  // Gestion des événements de souris
  const handlePlayButtonMouseEnter = () => setIsPlayButtonHovered(true);
  const handlePlayButtonMouseLeave = () => setIsPlayButtonHovered(false);
  const handleLevel1ButtonMouseEnter = () => setIsLevel1ButtonHovered(true);
  const handleLevel1ButtonMouseLeave = () => setIsLevel1ButtonHovered(false);
  const handleLevel2ButtonMouseEnter = () => setIsLevel2ButtonHovered(true);
  const handleLevel2ButtonMouseLeave = () => setIsLevel2ButtonHovered(false);
  const handleLevel3ButtonMouseEnter = () => setIsLevel3ButtonHovered(true);
  const handleLevel3ButtonMouseLeave = () => setIsLevel3ButtonHovered(false);

  // Rendu du menu principal
  if (gameState.gameState === 'menu') {
    return (
      <MainMenu
        isPlayButtonHovered={isPlayButtonHovered}
        isSoundEnabled={audio.isSoundEnabled}
        onPlayButtonClick={handlePlayButtonClick}
        onPlayButtonMouseEnter={handlePlayButtonMouseEnter}
        onPlayButtonMouseLeave={handlePlayButtonMouseLeave}
        onToggleSound={audio.toggleSound}
        forceStartMusic={audio.forceStartMusic}
      />
    );
  }

  // Rendu du menu de sélection de niveau
  if (gameState.gameState === 'levelSelect') {
    return (
      <LevelSelect
        windowSize={responsive.windowSize}
        isLevel1ButtonHovered={isLevel1ButtonHovered}
        isLevel2ButtonHovered={isLevel2ButtonHovered}
        isLevel3ButtonHovered={isLevel3ButtonHovered}
        isSoundEnabled={audio.isSoundEnabled}
        isLevelUnlocked={gameState.isLevelUnlocked}
        onLevel1ButtonClick={handleLevel1ButtonClick}
        onLevel2ButtonClick={handleLevel2ButtonClick}
        onLevel3ButtonClick={handleLevel3ButtonClick}
        onLevel1ButtonMouseEnter={handleLevel1ButtonMouseEnter}
        onLevel1ButtonMouseLeave={handleLevel1ButtonMouseLeave}
        onLevel2ButtonMouseEnter={handleLevel2ButtonMouseEnter}
        onLevel2ButtonMouseLeave={handleLevel2ButtonMouseLeave}
        onLevel3ButtonMouseEnter={handleLevel3ButtonMouseEnter}
        onLevel3ButtonMouseLeave={handleLevel3ButtonMouseLeave}
        onReturnToMenu={gameState.returnToMenu}
        onToggleSound={audio.toggleSound}
      />
    );
  }

  // Rendu du jeu
  return (
    <div 
      style={{
        height: '100vh',
        margin: 0,
        backgroundImage: `url(${gameState.currentLevel === 2 ? level2BackgroundUrl : backgroundImageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        position: 'relative',
        overflow: 'hidden'
      }}
      tabIndex={0}
    >
      {/* Interface utilisateur */}
      <GameUI
        windowSize={responsive.windowSize}
        playerHp={player.playerHp}
        remainingEnemies={enemies.getRemainingEnemies()}
        isSoundEnabled={audio.isSoundEnabled}
        onToggleSound={audio.toggleSound}
      />

      {/* Le reste du jeu sera ajouté dans un composant séparé */}
      <GameWorld 
        player={player}
        enemies={enemies}
        responsive={responsive}
        gameState={gameState}
        audio={audio}
        gameStartTime={gameStartTime}
        setGameStartTime={setGameStartTime}
        gameLoopRef={gameLoopRef}
        startGame={startGame}
      />
    </div>
  );
};

export default Block;