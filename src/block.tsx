import React, { useState, useEffect } from 'react';
import { BlockProps } from './types';
import { useAudio } from './hooks/useAudio';
import { useGame } from './hooks/useGame';
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
  const game = useGame(); // Ce hook contient maintenant toute la logique localStorage
  const { spriteScale, enemySpriteScale, treantSpriteScale, devilSpriteScale, observerSpriteScale, goblinSpriteScale, golemSpriteScale, demonSpriteScale } = useResponsiveScales();
  
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

  // Gestionnaires d'événements pour les boutons
  const handlePlayButtonClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    game.goToLevelSelect();
  };

  const handleContinueButtonClick = () => {
    game.continueGame();
  };

  const handleLevelClick = (level: number) => {
    game.startGame(level);
  };

  // Calculer le niveau maximum débloqué
  const getMaxUnlockedLevel = () => {
    return Math.max(...game.unlockedLevels);
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

  // Rendu conditionnel selon l'état du jeu
  if (game.gameState === 'menu') {
    return (
      <MainMenu
        isPlayButtonHovered={isPlayButtonHovered}
        isSoundEnabled={audio.isSoundEnabled}
        hasGameProgress={game.hasGameProgress()}
        progressPercentage={game.getProgressPercentage()}
        onPlayButtonClick={handlePlayButtonClick}
        onPlayButtonMouseEnter={() => setIsPlayButtonHovered(true)}
        onPlayButtonMouseLeave={() => setIsPlayButtonHovered(false)}
        onContinueButtonClick={handleContinueButtonClick}
        onResetProgressClick={game.resetGameProgress}
        onToggleSound={audio.toggleSound}
        onForceStartMusic={() => {}}
      />
    );
  }

  if (game.gameState === 'levelSelect') {
    return (
      <LevelSelect
        windowSize={{ width: window.innerWidth, height: window.innerHeight }}
        isSoundEnabled={audio.isSoundEnabled}
        maxUnlockedLevel={getMaxUnlockedLevel()}
        unlockedLevels={game.unlockedLevels}
        isLevelUnlocked={game.isLevelUnlocked}
        onLevelClick={handleLevelClick}
        onReturnToMenu={game.backToMenu}
        onToggleSound={audio.toggleSound}
      />
    );
  }

  if (game.gameState === 'playing') {
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
        playerIsInvincible={game.isInvincible}
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
        demonSpriteScale={demonSpriteScale}
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
        playerIsInvincible={game.isInvincible}
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
        demonSpriteScale={demonSpriteScale}
        isSoundEnabled={audio.isSoundEnabled}
        onToggleSound={audio.toggleSound}
      />
      
      {/* Menu de défaite superposé */}
      {game.gameState === 'gameover' && (
        <DefeatMenu
          onBackToLevels={game.goToLevelSelect}
          onRestart={() => game.startGame(game.level)}
        />
      )}
      
      {/* Menu de victoire superposé */}
      {game.gameState === 'victory' && (
        <VictoryMenu
          onNextLevel={() => game.startGame(game.level + 1)}
          onBackToLevels={game.goToLevelSelect}
          score={game.score}
          isLastLevel={game.level >= 9}
        />
      )}
    </>
  );

  return null;
};

export default Block;