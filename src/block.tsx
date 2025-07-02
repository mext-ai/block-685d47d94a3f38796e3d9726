import React, { useState, useEffect } from 'react';
import { BlockProps } from './types';
import { useAudio } from './hooks/useAudio';
import { useGame } from './hooks/useGame';
import { usePlayerControls } from './hooks/usePlayerControls';
import { usePlayerMovement } from './hooks/usePlayerMovement';
import { usePlayerAnimation } from './hooks/usePlayerAnimation';
import { useResponsiveScales } from './hooks/useResponsiveScales';
import { useGameMusic } from './hooks/useGameMusic';
import MainMenu from './components/MainMenu';
import LevelSelect from './components/LevelSelect';
import GameArea from './components/GameArea';
import DefeatMenu from './components/DefeatMenu';
import VictoryMenu from './components/VictoryMenu';

const Block: React.FC<BlockProps> = () => {
  // États pour les boutons hover
  const [isPlayButtonHovered, setIsPlayButtonHovered] = useState(false);
  const [isLevel1ButtonHovered, setIsLevel1ButtonHovered] = useState(false);
  const [isLevel2ButtonHovered, setIsLevel2ButtonHovered] = useState(false);
  const [isLevel3ButtonHovered, setIsLevel3ButtonHovered] = useState(false);

  // Hooks personnalisés
  const audio = useAudio();
  const game = useGame();
  const { spriteScale, enemySpriteScale, treantSpriteScale, devilSpriteScale } = useResponsiveScales();
  
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
    setPosition: game.setPlayerPosition
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

  const handleLevel1ButtonClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    game.startGame(1);
  };

  const handleLevel2ButtonClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    game.startGame(2);
  };

  const handleLevel3ButtonClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    game.startGame(3);
  };

  // Rendu conditionnel selon l'état du jeu
  if (game.gameState === 'menu') {
    return (
      <MainMenu
        isPlayButtonHovered={isPlayButtonHovered}
        isSoundEnabled={audio.isSoundEnabled}
        onPlayButtonClick={handlePlayButtonClick}
        onPlayButtonMouseEnter={() => setIsPlayButtonHovered(true)}
        onPlayButtonMouseLeave={() => setIsPlayButtonHovered(false)}
        onToggleSound={audio.toggleSound}
        onForceStartMusic={() => {}}
      />
    );
  }

  if (game.gameState === 'levelSelect') {
    return (
      <LevelSelect
        windowSize={{ width: window.innerWidth, height: window.innerHeight }}
        isLevel1ButtonHovered={isLevel1ButtonHovered}
        isLevel2ButtonHovered={isLevel2ButtonHovered}
        isLevel3ButtonHovered={isLevel3ButtonHovered}
        isSoundEnabled={audio.isSoundEnabled}
        isLevelUnlocked={game.isLevelUnlocked}
        onLevel1ButtonClick={handleLevel1ButtonClick}
        onLevel2ButtonClick={handleLevel2ButtonClick}
        onLevel3ButtonClick={handleLevel3ButtonClick}
        onLevel1ButtonMouseEnter={() => setIsLevel1ButtonHovered(true)}
        onLevel1ButtonMouseLeave={() => setIsLevel1ButtonHovered(false)}
        onLevel2ButtonMouseEnter={() => setIsLevel2ButtonHovered(true)}
        onLevel2ButtonMouseLeave={() => setIsLevel2ButtonHovered(false)}
        onLevel3ButtonMouseEnter={() => setIsLevel3ButtonHovered(true)}
        onLevel3ButtonMouseLeave={() => setIsLevel3ButtonHovered(false)}
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
        enemies={game.enemies}
        projectiles={game.projectiles}
        remainingEnemies={game.enemies.filter(e => e.isAlive).length}
        spriteScale={spriteScale}
        treantSpriteScale={treantSpriteScale}
        devilSpriteScale={devilSpriteScale}
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
        remainingEnemies={game.enemies.filter(e => e.isAlive).length}
        spriteScale={spriteScale}
        treantSpriteScale={treantSpriteScale}
        devilSpriteScale={devilSpriteScale}
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
          isLastLevel={game.level >= 3}
        />
      )}
    </>
  );

  return null;
};

export default Block; 