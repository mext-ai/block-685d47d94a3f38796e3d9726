import React from 'react';
import {
  HEART_SPRITE_SHEET_URL,
  SKULL_IMAGE_URL,
  WOOD_FRAME_IMAGE_URL,
  SPACE_KEY_IMAGE_URL,
  ARROW_KEYS_IMAGE_URL,
  SOUND_ON_BUTTON_URL,
  SOUND_OFF_BUTTON_URL
} from '../constants';

interface GameUIProps {
  playerHealth: number;
  remainingEnemies: number;
  isSoundEnabled: boolean;
  onToggleSound: () => void;
}

const GameUI: React.FC<GameUIProps> = ({
  playerHealth,
  remainingEnemies,
  isSoundEnabled,
  onToggleSound
}) => {
  return (
    <>
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
          const hpForThisHeart = playerHealth - (heartIndex * 2);
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
          backgroundImage: `url(${isSoundEnabled ? SOUND_ON_BUTTON_URL : SOUND_OFF_BUTTON_URL})`,
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          cursor: 'pointer',
          zIndex: 1000,
          transition: 'all 0.2s ease',
          filter: isSoundEnabled ? 'brightness(1)' : 'brightness(0.5) grayscale(100%)',
          transform: 'scale(1)'
        }}
        onClick={onToggleSound}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.filter = isSoundEnabled ? 
            'brightness(1.2) drop-shadow(0 0 10px rgba(255,255,255,0.6))' : 
            'brightness(0.7) grayscale(100%) drop-shadow(0 0 10px rgba(255,255,255,0.6))';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.filter = isSoundEnabled ? 'brightness(1)' : 'brightness(0.5) grayscale(100%)';
        }}
      />
    </>
  );
};

export default GameUI;