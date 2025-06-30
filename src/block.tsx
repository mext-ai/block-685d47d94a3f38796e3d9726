import React, { useState, useEffect, useRef } from 'react';
import { BlockProps } from './types';
import { useAudio } from './hooks/useAudio';
import { useGameState } from './hooks/useGameState';
import { usePlayerControls } from './hooks/usePlayerControls';
import MainMenu from './components/MainMenu';
import LevelSelect from './components/LevelSelect';
import { calculateResponsiveScale } from './utils/gameUtils';
import { 
  BACKGROUND_IMAGE_URL, 
  LEVEL2_BACKGROUND_URL,
  WALK_SPRITE_SHEET_URL,
  ATTACK_SPRITE_SHEET_URL,
  PLAYER_DEATH_SPRITE_SHEET_URL,
  HEART_SPRITE_SHEET_URL,
  SKULL_IMAGE_URL,
  WOOD_FRAME_IMAGE_URL,
  SPACE_KEY_IMAGE_URL,
  ARROW_KEYS_IMAGE_URL,
  SOUND_ON_BUTTON_URL,
  SOUND_OFF_BUTTON_URL,
  BACK_TO_LEVELS_BUTTON_URL,
  NEXT_LEVEL_BUTTON_URL,
  SPRITE_WIDTH,
  SPRITE_HEIGHT,
  WALK_FRAMES_PER_ROW,
  ATTACK_FRAMES_PER_ROW,
  PLAYER_DEATH_FRAMES_PER_ROW
} from './constants';

const Block: React.FC<BlockProps> = () => {
  // États pour les boutons hover
  const [isPlayButtonHovered, setIsPlayButtonHovered] = useState(false);
  const [isLevel1ButtonHovered, setIsLevel1ButtonHovered] = useState(false);
  const [isLevel2ButtonHovered, setIsLevel2ButtonHovered] = useState(false);
  const [isLevel3ButtonHovered, setIsLevel3ButtonHovered] = useState(false);

  // États du joueur
  const [currentFrame, setCurrentFrame] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isWalking, setIsWalking] = useState(false);
  const [isAttacking, setIsAttacking] = useState(false);
  const [attackFrame, setAttackFrame] = useState(0);

  // États pour les échelles responsives
  const [spriteScale, setSpriteScale] = useState(5.25);
  const [enemySpriteScale, setEnemySpriteScale] = useState(4.5);
  const [treantSpriteScale, setTreantSpriteScale] = useState(9);

  // Hooks personnalisés
  const audio = useAudio();
  const gameState = useGameState();

  // Références
  const playerDirectionRef = useRef(0);

  // Mettre à jour la référence de direction
  useEffect(() => {
    playerDirectionRef.current = direction;
  }, [direction]);

  // Recalculer les échelles quand la taille de fenêtre change
  useEffect(() => {
    const scales = calculateResponsiveScale(gameState.windowSize);
    setSpriteScale(scales.playerScale);
    setEnemySpriteScale(scales.enemyScale);
    setTreantSpriteScale(scales.treantScale);
  }, [gameState.windowSize]);

  // Contrôler la musique selon l'état du jeu
  useEffect(() => {
    if (!audio.backgroundMusic) return;

    const playMusic = async () => {
      if ((gameState.gameState === 'menu' || gameState.gameState === 'levelSelect') && audio.isSoundEnabled) {
        try {
          if (audio.backgroundMusic) {
            audio.backgroundMusic.currentTime = 0;
            await audio.backgroundMusic.play();
          }
        } catch (error) {
          console.log('Erreur lecture audio:', error);
        }
      } else {
        if (audio.backgroundMusic) {
          audio.backgroundMusic.pause();
        }
      }
    };

    playMusic();
  }, [gameState.gameState, audio.isSoundEnabled, audio.backgroundMusic]);

  // Gestion de la musique de jeu pour le niveau 1
  useEffect(() => {
    if (gameState.gameState === 'playing' && gameState.currentLevel === 1) {
      if (!audio.gameMusic) {
        const gameMusicUrl = 'https://www.dropbox.com/scl/fi/xwqj85vyt90g4mp7o1hif/flute-rain-flute-loop-ambient-short-loop-340800.mp3?rlkey=819wk666fxdt68uawl1pjbwud&st=4r8oib11&dl=1';
        const audioElement = new Audio(gameMusicUrl);
        audioElement.loop = true;
        audioElement.volume = 0.4;
        audioElement.preload = 'auto';
        audio.setGameMusic(audioElement);
        
        if (audio.isSoundEnabled) {
          setTimeout(() => {
            audioElement.play().catch(error => {
              console.log('Erreur lecture musique de jeu:', error);
            });
          }, 500);
        }
      }
    }
    
    return () => {
      if (audio.gameMusic && (gameState.gameState !== 'playing' || gameState.currentLevel !== 1)) {
        audio.gameMusic.pause();
        audio.gameMusic.currentTime = 0;
      }
    };
  }, [gameState.gameState, gameState.currentLevel, audio.isSoundEnabled, audio.gameMusic, audio.setGameMusic]);

  // Contrôler la musique de jeu selon l'état du son
  useEffect(() => {
    if (!audio.gameMusic) return;
    
    if (gameState.gameState === 'playing' && gameState.currentLevel === 1 && audio.isSoundEnabled) {
      audio.gameMusic.play().catch(error => {
        console.log('Erreur lecture musique de jeu:', error);
      });
    } else {
      audio.gameMusic.pause();
    }
  }, [gameState.gameState, gameState.currentLevel, audio.isSoundEnabled, audio.gameMusic]);

  // Animation du sprite de marche du joueur
  useEffect(() => {
    if (gameState.gameState !== 'playing') return;
    
    const walkAnimationInterval = setInterval(() => {
      if (isWalking && !isAttacking) {
        setCurrentFrame(prev => (prev + 1) % 3);
      }
    }, 150);

    return () => clearInterval(walkAnimationInterval);
  }, [isWalking, isAttacking, gameState.gameState]);

  // Animation d'attaque simple
  useEffect(() => {
    if (gameState.gameState !== 'playing' || gameState.isVictory || gameState.playerHp <= 0) return;
    
    if (isAttacking) {
      setAttackFrame(2);
      
      const step1 = setTimeout(() => {
        setAttackFrame(3);
      }, 120);
      
      const step2 = setTimeout(() => {
        setIsAttacking(false);
        setAttackFrame(0);
        // checkAttackHit(); // À implémenter
      }, 240);

      return () => {
        clearTimeout(step1);
        clearTimeout(step2);
      };
    }
  }, [isAttacking, gameState.gameState, gameState.isVictory, gameState.playerHp]);

  // Gestion des touches pour l'attaque
  useEffect(() => {
    if (gameState.gameState !== 'playing' || gameState.isVictory || gameState.playerHp <= 0) return;
    
    const handleKeyDown = (event: KeyboardEvent) => {
      event.preventDefault();
      const key = event.key.toLowerCase();
      
      if (key === ' ' && !isAttacking) {
        setIsAttacking(true);
        setIsWalking(false);
        return;
      }
      
      if (key === 'escape') {
        gameState.returnToLevelSelect();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAttacking, gameState.gameState, gameState.isVictory, gameState.playerHp, gameState.returnToLevelSelect]);

  // Initialisation unique au chargement du composant
  useEffect(() => {
    window.postMessage({ 
      type: 'BLOCK_COMPLETION', 
      blockId: 'image-background-block', 
      completed: true 
    }, '*');
    window.parent.postMessage({ 
      type: 'BLOCK_COMPLETION', 
      blockId: 'image-background-block', 
      completed: true 
    }, '*');
  }, []);

  // Fonctions pour gérer les clics sur les boutons
  const handlePlayButtonClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    gameState.goToLevelSelect();
  };

  const handleLevel1ButtonClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    gameState.startGame(1);
  };

  const handleLevel2ButtonClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    if (gameState.isLevelUnlocked(2)) {
      gameState.startGame(2);
    }
  };

  const handleLevel3ButtonClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    if (gameState.isLevelUnlocked(3)) {
      gameState.startGame(3);
    }
  };

  // Rendu du menu d'accueil
  if (gameState.gameState === 'menu') {
    return (
      <MainMenu
        isPlayButtonHovered={isPlayButtonHovered}
        isSoundEnabled={audio.isSoundEnabled}
        onPlayButtonClick={handlePlayButtonClick}
        onPlayButtonMouseEnter={() => setIsPlayButtonHovered(true)}
        onPlayButtonMouseLeave={() => setIsPlayButtonHovered(false)}
        onToggleSound={audio.toggleSound}
        onForceStartMusic={audio.forceStartMusic}
      />
    );
  }

  // Rendu du menu de sélection de niveau
  if (gameState.gameState === 'levelSelect') {
    return (
      <LevelSelect
        windowSize={gameState.windowSize}
        isLevel1ButtonHovered={isLevel1ButtonHovered}
        isLevel2ButtonHovered={isLevel2ButtonHovered}
        isLevel3ButtonHovered={isLevel3ButtonHovered}
        isSoundEnabled={audio.isSoundEnabled}
        isLevelUnlocked={gameState.isLevelUnlocked}
        onLevel1ButtonClick={handleLevel1ButtonClick}
        onLevel2ButtonClick={handleLevel2ButtonClick}
        onLevel3ButtonClick={handleLevel3ButtonClick}
        onLevel1ButtonMouseEnter={() => setIsLevel1ButtonHovered(true)}
        onLevel1ButtonMouseLeave={() => setIsLevel1ButtonHovered(false)}
        onLevel2ButtonMouseEnter={() => setIsLevel2ButtonHovered(true)}
        onLevel2ButtonMouseLeave={() => setIsLevel2ButtonHovered(false)}
        onLevel3ButtonMouseEnter={() => setIsLevel3ButtonHovered(true)}
        onLevel3ButtonMouseLeave={() => setIsLevel3ButtonHovered(false)}
        onReturnToMenu={gameState.returnToMenu}
        onToggleSound={audio.toggleSound}
      />
    );
  }

  // Calcul de la position dans le sprite sheet
  let spriteX, spriteY, currentSpriteUrl, backgroundSizeX;

  if (gameState.gameState === 'playing') {
    if (gameState.isPlayerDying) {
      spriteX = gameState.playerDeathFrame * SPRITE_WIDTH;
      spriteY = direction * SPRITE_HEIGHT;
      currentSpriteUrl = PLAYER_DEATH_SPRITE_SHEET_URL;
      backgroundSizeX = SPRITE_WIDTH * PLAYER_DEATH_FRAMES_PER_ROW * spriteScale;
    } else if (isAttacking) {
      spriteX = attackFrame * SPRITE_WIDTH;
      spriteY = direction * SPRITE_HEIGHT;
      currentSpriteUrl = ATTACK_SPRITE_SHEET_URL;
      backgroundSizeX = SPRITE_WIDTH * ATTACK_FRAMES_PER_ROW * spriteScale;
    } else {
      spriteX = currentFrame * SPRITE_WIDTH;
      spriteY = direction * SPRITE_HEIGHT;
      currentSpriteUrl = WALK_SPRITE_SHEET_URL;
      backgroundSizeX = SPRITE_WIDTH * WALK_FRAMES_PER_ROW * spriteScale;
    }
  }

  // Calcul du nombre d'ennemis restants
  const remainingEnemies = gameState.enemies.filter(enemy => enemy.isAlive || enemy.isDying).length;

  // Rendu du jeu
  return (
    <div 
      style={{
        height: '100vh',
        margin: 0,
        backgroundImage: `url(${gameState.currentLevel === 2 ? LEVEL2_BACKGROUND_URL : BACKGROUND_IMAGE_URL})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        position: 'relative',
        overflow: 'hidden'
      }}
      tabIndex={0}
    >
      {/* Personnage sprite */}
      {!gameState.isPlayerDisappeared && (
        <div style={{
          position: 'absolute',
          left: `${gameState.position.x}%`,
          top: `${gameState.position.y}%`,
          transform: 'translate(-50%, -50%)',
          width: `${SPRITE_WIDTH * spriteScale}px`,
          height: `${SPRITE_HEIGHT * spriteScale}px`,
          backgroundImage: `url(${currentSpriteUrl})`,
          backgroundPosition: `-${(spriteX ?? 0) * spriteScale}px -${(spriteY ?? 0) * spriteScale}px`,
          backgroundSize: `${backgroundSizeX}px auto`,
          imageRendering: 'pixelated',
          transition: 'none',
          zIndex: 10
        }} />
      )}

      {/* Système de cœurs */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        display: 'flex',
        gap: '6px',
        zIndex: 20
      }}>
        {[0, 1, 2, 3, 4].map(heartIndex => {
          const hpForThisHeart = gameState.playerHp - (heartIndex * 2);
          let heartState;
          if (hpForThisHeart >= 2) heartState = 0;
          else if (hpForThisHeart === 1) heartState = 1;
          else heartState = 2;
          
          const heartSize = 32;
          const heartScale = Math.max(1.5, Math.min(3.75, 2.25 * (gameState.windowSize.width / 1920)));
          
          return (
            <div
              key={heartIndex}
              style={{
                width: `${heartSize * heartScale}px`,
                height: `${heartSize * heartScale}px`,
                backgroundImage: `url(${HEART_SPRITE_SHEET_URL})`,
                backgroundPosition: `-${heartState * heartSize * heartScale}px 0px`,
                backgroundSize: `${heartSize * 3 * heartScale}px ${heartSize * heartScale}px`,
                imageRendering: 'pixelated'
              }}
            />
          );
        })}
      </div>

      {/* Compteur d'ennemis restants */}
      {gameState.gameState === 'playing' && (
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          zIndex: 20,
          backgroundImage: `url(${WOOD_FRAME_IMAGE_URL})`,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          padding: '4%',
          minWidth: '80px',
          minHeight: '50px',
        }}>
          <div style={{
            color: '#8B4513',
            fontSize: `${Math.max(20, gameState.windowSize.width * 0.018)}px`,
            fontWeight: 'bold',
            fontFamily: 'Comic Sans MS, cursive, Arial, sans-serif',
            textShadow: '2px 2px 0px #FFFFFF, -1px -1px 0px #FFFFFF, 1px -1px 0px #FFFFFF, -1px 1px 0px #FFFFFF',
            minWidth: '25px',
            textAlign: 'center'
          }}>
            {remainingEnemies}
          </div>
          
          <div style={{
            width: `${Math.max(40, gameState.windowSize.width * 0.03)}px`,
            height: `${Math.max(40, gameState.windowSize.width * 0.03)}px`,
            backgroundImage: `url(${SKULL_IMAGE_URL})`,
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.8))'
          }} />
        </div>
      )}

      {/* Contrôles */}
      <div style={{
        position: 'absolute',
        bottom: '10px',
        left: '10px',
        display: 'flex',
        flexDirection: 'row',
        gap: '15px',
        zIndex: 20
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '5px'
        }}>
          <div style={{
            width: gameState.windowSize.width * 0.06,
            height: '60px',
            backgroundImage: `url(${ARROW_KEYS_IMAGE_URL})`,
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.5))'
          }} />
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
          <div style={{
            width: gameState.windowSize.width * 0.06,
            height: '60px',
            backgroundImage: `url(${SPACE_KEY_IMAGE_URL})`,
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.5))'
          }} />
        </div>
      </div>

      {/* Bouton Son */}
      <div
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '60px',
          height: '60px',
          backgroundImage: `url(${audio.isSoundEnabled ? SOUND_ON_BUTTON_URL : SOUND_OFF_BUTTON_URL})`,
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          cursor: 'pointer',
          zIndex: 1000,
          transition: 'all 0.2s ease',
          filter: audio.isSoundEnabled ? 'brightness(1)' : 'brightness(0.5) grayscale(100%)',
          transform: 'scale(1)'
        }}
        onClick={audio.toggleSound}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.filter = audio.isSoundEnabled ? 
            'brightness(1.2) drop-shadow(0 0 10px rgba(255,255,255,0.6))' : 
            'brightness(0.7) grayscale(100%) drop-shadow(0 0 10px rgba(255,255,255,0.6))';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.filter = audio.isSoundEnabled ? 'brightness(1)' : 'brightness(0.5) grayscale(100%)';
        }}
      />
    </div>
  );
};

export default Block;