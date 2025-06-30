import React from 'react';
import { heartSpriteSheetUrl, skullImageUrl, woodFrameImageUrl, arrowKeysImageUrl, spaceKeyImageUrl, soundOnButtonUrl, soundOffButtonUrl } from '../constants';
import { WindowSize } from '../types';

interface GameUIProps {
  windowSize: WindowSize;
  playerHp: number;
  remainingEnemies: number;
  isSoundEnabled: boolean;
  onToggleSound: () => void;
}

export const GameUI: React.FC<GameUIProps> = ({
  windowSize,
  playerHp,
  remainingEnemies,
  isSoundEnabled,
  onToggleSound
}) => {
  const heartScale = 1.5;
  const skullSize = 40;

  const getHeartState = (heartIndex: number, currentHp: number) => {
    const heartValue = currentHp - heartIndex;
    if (heartValue >= 1) return 0; // Cœur plein
    if (heartValue > 0) return 1; // Cœur à moitié
    return 2; // Cœur vide
  };

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
          const heartState = getHeartState(heartIndex, playerHp);
          
          return (
            <div
              key={heartIndex}
              style={{
                width: `${32 * heartScale}px`,
                height: `${32 * heartScale}px`,
                backgroundImage: `url(${heartSpriteSheetUrl})`,
                backgroundPosition: `-${heartState * 32 * heartScale}px 0px`,
                backgroundSize: `${32 * 3 * heartScale}px ${32 * heartScale}px`,
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
        backgroundImage: `url(${woodFrameImageUrl})`,
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        padding: '4%',
        minWidth: '80px',
        minHeight: '50px',
      }}>
        {/* Nombre d'ennemis restants */}
        <div style={{
          color: '#8B4513',
          fontSize: `${Math.max(20, windowSize.width * 0.018)}px`,
          fontWeight: 'bold',
          fontFamily: 'Comic Sans MS, cursive, Arial, sans-serif',
          textShadow: '2px 2px 0px #FFFFFF, -1px -1px 0px #FFFFFF, 1px -1px 0px #FFFFFF, -1px 1px 0px #FFFFFF',
          minWidth: '25px',
          textAlign: 'center'
        }}>
          {remainingEnemies}
        </div>
        
        {/* Image du crâne */}
        <div style={{
          width: `${skullSize}px`,
          height: `${skullSize}px`,
          backgroundImage: `url(${skullImageUrl})`,
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
        {/* Image des flèches */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '5px'
        }}>
          <div style={{
            width: windowSize.width * 0.06,
            height: '60px',
            backgroundImage: `url(${arrowKeysImageUrl})`,
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.5))'
          }} />
        </div>

        {/* Image de la touche espace */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
          <div style={{
            width: windowSize.width * 0.06,
            height: '60px',
            backgroundImage: `url(${spaceKeyImageUrl})`,
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
          backgroundImage: `url(${isSoundEnabled ? soundOnButtonUrl : soundOffButtonUrl})`,
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