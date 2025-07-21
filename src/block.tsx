import React, { useState, useEffect } from 'react';
import { BlockProps } from './types';
import { useAudio } from './hooks/useAudio';
import { useGame } from './hooks/useGame';
import { useGameState } from './hooks/useGameState';
import { usePlayerControls } from './hooks/usePlayerControls';
import { usePlayerMovement } from './hooks/usePlayerMovement';
import { usePlayerAnimation } from './hooks/usePlayerAnimation';
import { useResponsiveScales } from './hooks/useResponsiveScales';
import { useGameMusic } from './hooks/useGameMusic';
import { useAssetLoader } from './hooks/useAssetLoader';
import MainMenu from './components/MainMenu';
import LevelSelect from './components/LevelSelect';
import GameArea from './components/GameArea';
import DefeatMenu from './components/DefeatMenu';
import VictoryMenu from './components/VictoryMenu';
import LoadingScreen from './components/LoadingScreen';

const Block: React.FC<BlockProps> = () => {
  // États pour les boutons hover
  const [isPlayButtonHovered, setIsPlayButtonHovered] = useState(false);

  // Hook de chargement des assets
  const assetLoader = useAssetLoader();

  // Hooks personnalisés
  const audio = useAudio();
  const game = useGame();
  const gameState = useGameState(); // Hook pour la persistence localStorage
  const { spriteScale, enemySpriteScale, treantSpriteScale, devilSpriteScale, observerSpriteScale, goblinSpriteScale, golemSpriteScale } = useResponsiveScales();
  
  // Utiliser le système d'attaque du hook useGame
  const { isAttacking, attackFrame, triggerAttack, setPlayerDirection } = game;

  // Contrôles du joueur
  const { keys, isWalking, direction } = usePlayerControls({
    gameState: game.gameState,
    playerHealth: game.playerHealth,
    isAttacking,
    triggerAttack,
    backToMenu: game.backToMenu
  });

  // Mouvement du joueur
  usePlayerMovement({
    gameState: game.gameState,
    playerHealth: game.playerHealth,
    isAttacking,
    keys,
    position: game.playerPosition,
    enemies: game.enemies,
    setPosition: game.setPlayerPosition,
    setEnemies: game.setEnemies
  });

  // Animation du joueur
  const { currentFrame, deathFrame } = usePlayerAnimation({
    gameState: game.gameState,
    isWalking,
    isDead: game.playerHealth <= 0
  });

  // Musique de jeu
  useGameMusic({
    gameState: game.gameState,
    level: game.level,
    isSoundEnabled: audio.isSoundEnabled,
    backgroundMusic: audio.backgroundMusic,
    gameMusic: audio.gameMusic,
    setGameMusic: audio.setGameMusic
  });

  // Mettre à jour la direction du joueur dans le système de jeu
  useEffect(() => {
    setPlayerDirection(direction);
  }, [direction, setPlayerDirection]);

  // Synchroniser les niveaux débloqués entre les deux systèmes
  useEffect(() => {
    if (game.gameState === 'victory') {
      // Marquer le niveau comme complété dans le système localStorage
      if (!gameState.completedLevels.includes(game.level)) {
        // Cette logique sera gérée automatiquement par useGameState lors de la victoire
      }
    }
  }, [game.gameState, game.level, gameState.completedLevels]);

  // Gestionnaires d'événements pour les boutons
  const handlePlayButtonClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    // Utiliser la fonction de gameState pour aller à la sélection de niveau
    gameState.goToLevelSelect();
    // Synchroniser avec le système de jeu
    game.goToLevelSelect();
  };

  const handleContinueButtonClick = () => {
    gameState.continueGame();
    // Synchroniser avec le système de jeu
    game.startGame(gameState.currentLevel);
  };

  const handleLevelClick = (level: number) => {
    // Utiliser gameState pour démarrer le niveau
    gameState.startGame(level);
    // Synchroniser avec le système de jeu
    game.startGame(level);
  };

  const handleReturnToMenu = () => {
    gameState.returnToMenu();
    game.backToMenu();
  };

  const handleReturnToLevelSelect = () => {
    gameState.returnToLevelSelect();
    game.goToLevelSelect();
  };

  // Calculer le niveau maximum débloqué en utilisant gameState
  const getMaxUnlockedLevel = () => {
    return gameState.highestLevel;
  };

  // Fonction pour vérifier si un niveau est débloqué
  const isLevelUnlocked = (level: number) => {
    return gameState.isLevelUnlocked(level);
  };

  // Afficher l'écran de chargement si les assets ne sont pas encore chargés
  if (assetLoader.isLoading) {
    return (
      <LoadingScreen
        progress={assetLoader.progress}
        totalAssets={assetLoader.totalAssets}
        loadedAssets={assetLoader.loadedAssets}
        error={assetLoader.error}
      />
    );
  }

  // Utiliser l'état du gameState localStorage comme état principal
  const currentGameState = gameState.gameState;

  // Rendu conditionnel selon l'état du jeu
  if (currentGameState === 'menu') {
    return (
      <MainMenu
        isPlayButtonHovered={isPlayButtonHovered}
        isSoundEnabled={audio.isSoundEnabled}
        hasGameProgress={gameState.hasGameProgress()}
        progressPercentage={gameState.getProgressPercentage()}
        onPlayButtonClick={handlePlayButtonClick}
        onPlayButtonMouseEnter={() => setIsPlayButtonHovered(true)}
        onPlayButtonMouseLeave={() => setIsPlayButtonHovered(false)}
        onContinueButtonClick={handleContinueButtonClick}
        onResetProgressClick={gameState.resetGameProgress}
        onToggleSound={audio.toggleSound}
        onForceStartMusic={() => {}}
      />
    );
  }

  if (currentGameState === 'levelSelect') {
    return (
      <LevelSelect
        windowSize={gameState.windowSize}
        isSoundEnabled={audio.isSoundEnabled}
        maxUnlockedLevel={getMaxUnlockedLevel()}
        completedLevels={gameState.completedLevels}
        isLevelUnlocked={isLevelUnlocked}
        onLevelClick={handleLevelClick}
        onReturnToMenu={handleReturnToMenu}
        onToggleSound={audio.toggleSound}
      />
    );
  }

  if (currentGameState === 'playing') {
    return (
      <GameArea
        level={game.level}
        playerPosition={game.playerPosition}
        playerDirection={direction}
        playerCurrentFrame={currentFrame}
        playerIsWalking={isWalking}
        playerIsAttacking={isAttacking}
        playerAttackFrame={attackFrame}
        playerIsDead={game.playerHealth <= 0}
        playerDeathFrame={deathFrame}
        playerHealth={game.playerHealth}
        enemies={game.enemies}
        projectiles={game.projectiles}
        hearts={game.hearts}
        remainingEnemies={game.enemies.filter(e => e.isAlive).length}
        spriteScale={spriteScale}
        treantSpriteScale={treantSpriteScale}
        devilSpriteScale={devilSpriteScale}
        observerSpriteScale={observerSpriteScale}
        goblinSpriteScale={goblinSpriteScale}
        golemSpriteScale={golemSpriteScale}
        isSoundEnabled={audio.isSoundEnabled}
        onToggleSound={audio.toggleSound}
      />
    );
  }

  // Rendu du jeu avec menus superposés si nécessaire
  return (
    <>
      {/* GameArea toujours visible en arrière-plan */}
      <GameArea
        level={game.level}
        playerPosition={game.playerPosition}
        playerDirection={direction}
        playerCurrentFrame={currentFrame}
        playerIsWalking={isWalking}
        playerIsAttacking={isAttacking}
        playerAttackFrame={attackFrame}
        playerIsDead={game.playerHealth <= 0}
        playerDeathFrame={deathFrame}
        playerHealth={game.playerHealth}
        enemies={game.enemies}
        projectiles={game.projectiles}
        hearts={game.hearts}
        remainingEnemies={game.enemies.filter(e => e.isAlive).length}
        spriteScale={spriteScale}
        treantSpriteScale={treantSpriteScale}
        devilSpriteScale={devilSpriteScale}
        observerSpriteScale={observerSpriteScale}
        goblinSpriteScale={goblinSpriteScale}
        golemSpriteScale={golemSpriteScale}
        isSoundEnabled={audio.isSoundEnabled}
        onToggleSound={audio.toggleSound}
      />
      
      {/* Menu de défaite superposé */}
      {currentGameState === 'gameover' && (
        <DefeatMenu
          onBackToLevels={handleReturnToLevelSelect}
          onRestart={() => handleLevelClick(gameState.currentLevel)}
        />
      )}
      
      {/* Menu de victoire superposé */}
      {currentGameState === 'victory' && (
        <VictoryMenu
          onNextLevel={() => handleLevelClick(gameState.currentLevel + 1)}
          onBackToLevels={handleReturnToLevelSelect}
          score={game.score}
          isLastLevel={gameState.currentLevel >= gameState.getMaxLevel()}
        />
      )}
    </>
  );

  return null;
};

export default Block;