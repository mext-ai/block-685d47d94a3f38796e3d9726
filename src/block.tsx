import React, { useState, useEffect, useRef } from 'react';
import { BlockProps } from './types';
import { useAudio } from './hooks/useAudio';
import { useGame } from './hooks/useGame';
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
  RESTART_BUTTON_URL,
  GAME_OVER_BACKGROUND_URL,
  MUSHROOM_SPRITE_SHEET_URL,
  MUSHROOM_DEATH_SPRITE_SHEET_URL,
  MUSHROOM_ATTACK_SPRITE_SHEET_URL,
  TREANT_WALK_SPRITE_SHEET_URL,
  TREANT_DEATH_SPRITE_SHEET_URL,
  TREANT_ATTACK_SPRITE_SHEET_URL,
  SPRITE_WIDTH,
  SPRITE_HEIGHT,
  WALK_FRAMES_PER_ROW,
  ATTACK_FRAMES_PER_ROW,
  DEATH_FRAMES_PER_ROW,
  PLAYER_DEATH_FRAMES_PER_ROW,
  TREANT_WALK_FRAMES_PER_ROW,
  TREANT_DEATH_FRAMES_PER_ROW,
  TREANT_ATTACK_FRAMES_PER_ROW
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
  // États pour les échelles responsives

  // États pour les échelles responsives
  const [spriteScale, setSpriteScale] = useState(5.25);
  const [enemySpriteScale, setEnemySpriteScale] = useState(4.5);
  const [treantSpriteScale, setTreantSpriteScale] = useState(9);

  // Hooks personnalisés
  const audio = useAudio();
  const game = useGame();
  
  // Utiliser le système d'attaque du hook useGame
  const { isAttacking, attackFrame, triggerAttack, setPlayerDirection } = game;

  // Références
  const playerDirectionRef = useRef(0);

  // Mettre à jour la référence de direction
  useEffect(() => {
    playerDirectionRef.current = direction;
  }, [direction]);

  // Recalculer les échelles quand la taille de fenêtre change
  useEffect(() => {
    const scales = calculateResponsiveScale({ width: window.innerWidth, height: window.innerHeight });
    setSpriteScale(scales.playerScale);
    setEnemySpriteScale(scales.enemyScale);
    setTreantSpriteScale(scales.treantScale);
  }, []);

  // Contrôler la musique selon l'état du jeu
  useEffect(() => {
    if (!audio.backgroundMusic) return;

    const playMusic = async () => {
      if ((game.gameState === 'menu' || game.gameState === 'levelSelect') && audio.isSoundEnabled) {
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
  }, [game.gameState, audio.isSoundEnabled, audio.backgroundMusic]);

  // Gestion de la musique de jeu pour le niveau 1
  useEffect(() => {
    if (game.gameState === 'playing' && game.level === 1) {
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
      if (audio.gameMusic && (game.gameState !== 'playing' || game.level !== 1)) {
        audio.gameMusic.pause();
        audio.gameMusic.currentTime = 0;
      }
    };
  }, [game.gameState, game.level, audio.isSoundEnabled, audio.gameMusic, audio.setGameMusic]);

  // Contrôler la musique de jeu selon l'état du son
  useEffect(() => {
    if (!audio.gameMusic) return;
    
    if (game.gameState === 'playing' && game.level === 1 && audio.isSoundEnabled) {
      audio.gameMusic.play().catch(error => {
        console.log('Erreur lecture musique de jeu:', error);
      });
    } else {
      audio.gameMusic.pause();
    }
  }, [game.gameState, game.level, audio.isSoundEnabled, audio.gameMusic]);

  // Animation du sprite de marche du joueur
  useEffect(() => {
    if (game.gameState !== 'playing') return;
    
    const walkAnimationInterval = setInterval(() => {
      if (isWalking) {
        setCurrentFrame(prev => (prev + 1) % 3);
      }
    }, 150);

    return () => clearInterval(walkAnimationInterval);
  }, [isWalking, game.gameState]);

  // L'animation d'attaque est maintenant gérée dans useAttackSystem

  // Système de contrôles avec mouvement continu
  const [keys, setKeys] = useState({ up: false, down: false, left: false, right: false });

  // Gestion des touches pour l'attaque et les contrôles
  useEffect(() => {
    if (game.gameState !== 'playing' || game.playerHealth <= 0) return;
    
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      
      if (key === ' ' && !isAttacking) {
        event.preventDefault();
        triggerAttack();
        setIsWalking(false);
        return;
      }
      
      if (key === 'escape') {
        event.preventDefault();
        game.backToMenu();
        return;
      }

      // Mettre à jour l'état des touches (sans preventDefault pour les touches de mouvement)
      setKeys(prev => {
        const newKeys = { ...prev };
        if (key === 'w' || key === 'arrowup') newKeys.up = true;
        if (key === 's' || key === 'arrowdown') newKeys.down = true;
        if (key === 'a' || key === 'arrowleft') newKeys.left = true;
        if (key === 'd' || key === 'arrowright') newKeys.right = true;
        return newKeys;
      });
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      
      setKeys(prev => {
        const newKeys = { ...prev };
        if (key === 'w' || key === 'arrowup') newKeys.up = false;
        if (key === 's' || key === 'arrowdown') newKeys.down = false;
        if (key === 'a' || key === 'arrowleft') newKeys.left = false;
        if (key === 'd' || key === 'arrowright') newKeys.right = false;
        return newKeys;
      });
    };

    const handleWindowBlur = () => {
      setKeys({ up: false, down: false, left: false, right: false });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleWindowBlur);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [isAttacking, game.gameState, game.playerHealth, game.backToMenu]);

  // Mouvement continu basé sur l'état des touches
  useEffect(() => {
    if (game.gameState !== 'playing' || game.playerHealth <= 0) return;

    const moveInterval = setInterval(() => {
      let dx = 0;
      let dy = 0;
      
      // Mouvement vertical
      if (keys.up) {
        dy = -1;
        setDirection(1); // Haut
        setPlayerDirection(1);
      } else if (keys.down) {
        dy = 1;
        setDirection(0); // Bas
        setPlayerDirection(0);
      }
      
      // Mouvement horizontal
      if (keys.left) {
        dx = -1;
        setDirection(2); // Gauche
        setPlayerDirection(2);
      } else if (keys.right) {
        dx = 1;
        setDirection(3); // Droite
        setPlayerDirection(3);
      }

      // Appliquer le mouvement (même pendant l'attaque)
      if (dx !== 0 || dy !== 0) {
        game.movePlayer(dx, dy);
        setIsWalking(true);
      } else {
        setIsWalking(false);
        setCurrentFrame(1); // Frame statique quand pas de mouvement
      }
    }, 8); // ~120 FPS pour un mouvement plus fluide

    return () => clearInterval(moveInterval);
  }, [keys, game.gameState, game.playerHealth, game.movePlayer]);

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
    // Pour l'instant, on va directement au niveau 1
    game.startGame();
  };

  const handleLevel1ButtonClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    game.startGame();
  };

  const handleLevel2ButtonClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    // Pour l'instant, on va au niveau 1
    game.startGame();
  };

  const handleLevel3ButtonClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    // Pour l'instant, on va au niveau 1
    game.startGame();
  };

  // Rendu du menu d'accueil
  if (game.gameState === 'menu') {
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
  if (game.gameState === 'levelSelect') {
    return (
      <LevelSelect
        windowSize={{ width: window.innerWidth, height: window.innerHeight }}
        isLevel1ButtonHovered={isLevel1ButtonHovered}
        isLevel2ButtonHovered={isLevel2ButtonHovered}
        isLevel3ButtonHovered={isLevel3ButtonHovered}
        isSoundEnabled={audio.isSoundEnabled}
        isLevelUnlocked={(level: number) => level === 1} // Pour l'instant, seul le niveau 1 est débloqué
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

  // Calcul de la position dans le sprite sheet (exactement comme dans l'original)
  let spriteX, spriteY, currentSpriteUrl, backgroundSizeX;

  if (game.gameState === 'playing') {
    if (isAttacking) {
      // Pendant l'attaque, utiliser les frames d'attaque
      spriteX = attackFrame * SPRITE_WIDTH;
      spriteY = direction * SPRITE_HEIGHT;
      currentSpriteUrl = ATTACK_SPRITE_SHEET_URL;
      backgroundSizeX = SPRITE_WIDTH * ATTACK_FRAMES_PER_ROW * spriteScale;
    } else {
      // En marche normale, utiliser les frames de marche
      spriteX = currentFrame * SPRITE_WIDTH;
      spriteY = direction * SPRITE_HEIGHT;
      currentSpriteUrl = WALK_SPRITE_SHEET_URL;
      backgroundSizeX = SPRITE_WIDTH * WALK_FRAMES_PER_ROW * spriteScale;
    }
  }

  // Calcul du nombre d'ennemis restants
  const remainingEnemies = game.enemies.filter((enemy: any) => enemy.isAlive || enemy.isDying).length;

  // Rendu du jeu
  return (
    <div 
      style={{
        height: '100vh',
        margin: 0,
        backgroundImage: `url(${BACKGROUND_IMAGE_URL})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        position: 'relative',
        overflow: 'hidden'
      }}
      tabIndex={0}
    >
      {/* Personnage sprite */}
      <div style={{
        position: 'absolute',
        left: `${game.playerPosition.x}%`,
        top: `${game.playerPosition.y}%`,
        transform: 'translate(-50%, -50%)',
        width: `${SPRITE_WIDTH * spriteScale}px`,
        height: `${SPRITE_HEIGHT * spriteScale}px`,
        backgroundImage: `url(${currentSpriteUrl})`,
        backgroundPosition: `-${(spriteX ?? 0) * spriteScale}px -${(spriteY ?? 0) * spriteScale}px`,
        backgroundSize: `${backgroundSizeX}px auto`,
        imageRendering: 'pixelated',
        transition: 'none',
        zIndex: 10,
      }} />

      {/* Ennemis */}
      {game.gameState === 'playing' && game.enemies.map((enemy: any) => {
        if (!enemy.hasSpawned) return null;
        
        const isTreant = enemy.type === 'treant';
        let spriteUrl, framesPerRow, currentFrame;
        
        if (enemy.isDying) {
          // Animation de mort
          spriteUrl = isTreant ? TREANT_DEATH_SPRITE_SHEET_URL : MUSHROOM_DEATH_SPRITE_SHEET_URL;
          framesPerRow = isTreant ? TREANT_DEATH_FRAMES_PER_ROW : DEATH_FRAMES_PER_ROW;
          currentFrame = enemy.deathFrame;
        } else if (enemy.isAttacking) {
          // Animation d'attaque
          spriteUrl = isTreant ? TREANT_ATTACK_SPRITE_SHEET_URL : MUSHROOM_ATTACK_SPRITE_SHEET_URL;
          framesPerRow = isTreant ? TREANT_ATTACK_FRAMES_PER_ROW : ATTACK_FRAMES_PER_ROW;
          currentFrame = enemy.attackFrame;
        } else {
          // Animation de marche
          spriteUrl = isTreant ? TREANT_WALK_SPRITE_SHEET_URL : MUSHROOM_SPRITE_SHEET_URL;
          framesPerRow = isTreant ? TREANT_WALK_FRAMES_PER_ROW : WALK_FRAMES_PER_ROW;
          currentFrame = enemy.currentFrame;
        }
        
        const spriteScale = isTreant ? treantSpriteScale : enemySpriteScale;
        
        return (
          <div key={enemy.id}>
            <div
                          style={{
              position: 'absolute',
              left: `${enemy.x}%`,
              top: `${enemy.y}%`,
                transform: 'translate(-50%, -50%)',
                width: `${SPRITE_WIDTH * spriteScale}px`,
                height: `${SPRITE_HEIGHT * spriteScale}px`,
                backgroundImage: `url(${spriteUrl})`,
                backgroundPosition: `-${currentFrame * SPRITE_WIDTH * spriteScale}px -${enemy.direction * SPRITE_HEIGHT * spriteScale}px`,
                backgroundSize: `${SPRITE_WIDTH * framesPerRow * spriteScale}px auto`,
                imageRendering: 'pixelated',
                transition: 'none',
                zIndex: 5,
                opacity: enemy.isAlive ? 1 : 0.5,
                filter: enemy.isDying ? 'grayscale(100%)' : 'none'
              }}
            />
            
            {/* Barre de vie de l'ennemi */}
            {!enemy.isDying && (
              <div
                style={{
                  position: 'absolute',
                  left: `${enemy.x}%`,
                  top: `${enemy.y - (isTreant ? 
                    Math.max(7, 4 + (treantSpriteScale / 2)) : 
                    Math.max(5, 3 + (enemySpriteScale / 2)))}%`,
                  transform: 'translateX(-50%)',
                  width: `${(isTreant ? 40 : 60) * ((isTreant ? treantSpriteScale : enemySpriteScale) / 3)}px`,
                  height: `${Math.max(8, (isTreant ? 10 : 12) * ((isTreant ? treantSpriteScale : enemySpriteScale) / 5))}px`,
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  border: '1px solid #333',
                  borderRadius: '3px',
                  zIndex: 11
                }}
              >
                <div
                  style={{
                    width: `${(enemy.hp / enemy.maxHp) * 100}%`,
                    height: '100%',
                    backgroundColor: enemy.hp > enemy.maxHp * 0.6 ? '#4CAF50' : 
                                   enemy.hp > enemy.maxHp * 0.3 ? '#FF9800' : '#F44336',
                    borderRadius: '2px',
                    transition: 'width 0.3s ease, background-color 0.3s ease'
                  }}
                />
              </div>
            )}
          </div>
        );
      })}

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
          const hpForThisHeart = game.playerHealth - (heartIndex * 2);
          let heartState;
          if (hpForThisHeart >= 2) heartState = 0;
          else if (hpForThisHeart === 1) heartState = 1;
          else heartState = 2;
          
          const heartSize = 32;
          const heartScale = Math.max(1.5, Math.min(3.75, 2.25 * (window.innerWidth / 1920)));
          
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
      {game.gameState === 'playing' && (
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
            fontSize: `${Math.max(20, window.innerWidth * 0.018)}px`,
            fontWeight: 'bold',
            fontFamily: 'Comic Sans MS, cursive, Arial, sans-serif',
            textShadow: '2px 2px 0px #FFFFFF, -1px -1px 0px #FFFFFF, 1px -1px 0px #FFFFFF, -1px 1px 0px #FFFFFF',
            minWidth: '25px',
            textAlign: 'center'
          }}>
            {remainingEnemies}
          </div>
          
          <div style={{
            width: `${Math.max(40, window.innerWidth * 0.03)}px`,
            height: `${Math.max(40, window.innerWidth * 0.03)}px`,
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
            width: window.innerWidth * 0.06,
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
            width: window.innerWidth * 0.06,
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

      {/* Écran de victoire */}
      {game.gameState === 'victory' && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: `${Math.max(500, window.innerWidth * 0.5)}px`,
          height: `${Math.max(400, window.innerHeight * 0.4)}px`,
          backgroundImage: `url(https://drive.google.com/thumbnail?id=1cMdqOupNWB-eIM1VFCVvvNfUsJkvinS7&sz=w1000)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          color: 'gold',
          padding: '30px',
          borderRadius: '15px',
          textAlign: 'center',
          fontSize: `${Math.max(24, window.innerWidth * 0.02)}px`,
          fontWeight: 'bold',
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <div style={{ 
            display: 'flex', 
            gap: '30px', 
            marginTop: "25%",
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            {/* Bouton Next Level (incliquable pour l'instant) */}
            <div
              style={{
                width: `${Math.max(80, window.innerWidth * 0.06)}px`,
                height: `${Math.max(80, window.innerWidth * 0.06)}px`,
                backgroundImage: `url(${NEXT_LEVEL_BUTTON_URL})`,
                backgroundSize: 'contain',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                cursor: 'not-allowed',
                transition: 'all 0.2s ease',
                filter: 'brightness(0.7) drop-shadow(0 0 5px rgba(0,0,0,0.3))',
                transform: 'scale(1)',
                opacity: 0.7
              }}
            />
            
            {/* Bouton Retour aux niveaux */}
            <div
              onClick={() => game.backToMenu()}
              style={{
                width: `${Math.max(80, window.innerWidth * 0.06)}px`,
                height: `${Math.max(80, window.innerWidth * 0.06)}px`,
                backgroundImage: `url(${BACK_TO_LEVELS_BUTTON_URL})`,
                backgroundSize: 'contain',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                filter: 'brightness(1) drop-shadow(0 0 5px rgba(0,0,0,0.3))',
                transform: 'scale(1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
                e.currentTarget.style.filter = 'brightness(1.2) drop-shadow(0 0 15px rgba(255,255,255,0.6))';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.filter = 'brightness(1) drop-shadow(0 0 5px rgba(0,0,0,0.3))';
              }}
            />
          </div>
        </div>
      )}

      {/* Écran de défaite */}
      {game.gameState === 'gameover' && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: `${Math.max(500, window.innerWidth * 0.5)}px`,
          height: `${Math.max(400, window.innerHeight * 0.4)}px`,
          backgroundImage: `url(${GAME_OVER_BACKGROUND_URL})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          color: 'red',
          padding: '30px',
          borderRadius: '15px',
          textAlign: 'center',
          fontSize: `${Math.max(24, window.innerWidth * 0.02)}px`,
          fontWeight: 'bold',
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <div style={{ 
            display: 'flex', 
            gap: '30px', 
            marginTop: "25%",
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            
            {/* Bouton Retour aux niveaux avec image */}
            <div
              onClick={() => game.backToMenu()}
              style={{
                width: `${Math.max(80, window.innerWidth * 0.06)}px`,
                height: `${Math.max(80, window.innerWidth * 0.06)}px`,
                backgroundImage: `url(${BACK_TO_LEVELS_BUTTON_URL})`,
                backgroundSize: 'contain',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                filter: 'brightness(1) drop-shadow(0 0 5px rgba(0,0,0,0.3))',
                transform: 'scale(1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
                e.currentTarget.style.filter = 'brightness(1.2) drop-shadow(0 0 15px rgba(255,255,255,0.6))';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.filter = 'brightness(1) drop-shadow(0 0 5px rgba(0,0,0,0.3))';
              }}
            />
            {/* Bouton Restart avec image spiral */}
            <div
              onClick={() => game.startGame()}
              style={{
                width: `${Math.max(80, window.innerWidth * 0.06)}px`,
                height: `${Math.max(80, window.innerWidth * 0.06)}px`,
                backgroundImage: `url(${RESTART_BUTTON_URL})`,
                backgroundSize: 'contain',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                filter: 'brightness(1) drop-shadow(0 0 5px rgba(0,0,0,0.3))',
                transform: 'scale(1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
                e.currentTarget.style.filter = 'brightness(1.2) drop-shadow(0 0 15px rgba(255,255,255,0.6))';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.filter = 'brightness(1) drop-shadow(0 0 5px rgba(0,0,0,0.3))';
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Block;