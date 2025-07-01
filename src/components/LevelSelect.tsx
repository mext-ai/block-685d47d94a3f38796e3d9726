import React from 'react';
import {
  MENU_BACKGROUND_URL,
  LEVEL_MENU_BACKGROUND_URL,
  LEVEL1_BUTTON_URL,
  LEVEL2_BUTTON_LOCKED_URL,
  LEVEL2_BUTTON_UNLOCKED_URL,
  LEVEL3_BUTTON_LOCKED_URL,
  LEVEL3_BUTTON_URL,
  LEVEL3_BUTTON_UNLOCKED_URL,
  SOUND_ON_BUTTON_URL,
  SOUND_OFF_BUTTON_URL
} from '../constants';

interface LevelSelectProps {
  windowSize: { width: number; height: number };
  isLevel1ButtonHovered: boolean;
  isLevel2ButtonHovered: boolean;
  isLevel3ButtonHovered: boolean;
  isSoundEnabled: boolean;
  isLevelUnlocked: (level: number) => boolean;
  onLevel1ButtonClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  onLevel2ButtonClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  onLevel3ButtonClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  onLevel1ButtonMouseEnter: () => void;
  onLevel1ButtonMouseLeave: () => void;
  onLevel2ButtonMouseEnter: () => void;
  onLevel2ButtonMouseLeave: () => void;
  onLevel3ButtonMouseEnter: () => void;
  onLevel3ButtonMouseLeave: () => void;
  onReturnToMenu: () => void;
  onToggleSound: () => void;
}

const LevelSelect: React.FC<LevelSelectProps> = ({
  windowSize,
  isLevel1ButtonHovered,
  isLevel2ButtonHovered,
  isLevel3ButtonHovered,
  isSoundEnabled,
  isLevelUnlocked,
  onLevel1ButtonClick,
  onLevel2ButtonClick,
  onLevel3ButtonClick,
  onLevel1ButtonMouseEnter,
  onLevel1ButtonMouseLeave,
  onLevel2ButtonMouseEnter,
  onLevel2ButtonMouseLeave,
  onLevel3ButtonMouseEnter,
  onLevel3ButtonMouseLeave,
  onReturnToMenu,
  onToggleSound
}) => {
  const MENU_BACKGROUND_HEIGHT = Math.min(windowSize.height * 0.3, 250);
  const MENU_BACKGROUND_WIDTH = Math.min(windowSize.width * 0.5, MENU_BACKGROUND_HEIGHT * 3);

  return (
    <div 
      style={{
        height: '100vh',
        width: '100vw',
        margin: 0,
        backgroundImage: `url(${MENU_BACKGROUND_URL})`,
        backgroundSize: 'contain',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#1a1a1a',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      {/* Rectangle background du menu des niveaux */}
      <div
        style={{
          position: 'relative',
          width: `${MENU_BACKGROUND_WIDTH}px`,
          height: `${MENU_BACKGROUND_HEIGHT}px`,
          backgroundImage: `url(${LEVEL_MENU_BACKGROUND_URL})`,
          backgroundSize: '75% 100%',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          zIndex: 5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0'
        }}
      >
        {/* Conteneur des boutons */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '70%',
            height: '100%',
            position: 'relative',
            gap: '36px'
          }}
        >
          {/* Bouton Niveau 1 */}
          <div
            style={{
              width: `${MENU_BACKGROUND_WIDTH * 0.12}px`,
              height: `${MENU_BACKGROUND_WIDTH * 0.12 * 2}px`,
              backgroundImage: `url(${LEVEL1_BUTTON_URL})`,
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              filter: isLevel1ButtonHovered ? 
                'brightness(1.2) drop-shadow(0 0 10px rgba(255,255,255,0.6))' : 
                'brightness(1) drop-shadow(0 0 3px rgba(0,0,0,0.3))',
              transform: `scale(${isLevel1ButtonHovered ? 1.1 : 1})`,
              zIndex: 10
            }}
            onClick={onLevel1ButtonClick}
            onMouseEnter={onLevel1ButtonMouseEnter}
            onMouseLeave={onLevel1ButtonMouseLeave}
          />

          {/* Bouton Niveau 2 */}
          <div
            style={{
              width: `${MENU_BACKGROUND_WIDTH * 0.12}px`,
              height: `${MENU_BACKGROUND_WIDTH * 0.12 * 2}px`,
              backgroundImage: `url(${isLevelUnlocked(2) ? LEVEL2_BUTTON_UNLOCKED_URL : LEVEL2_BUTTON_LOCKED_URL})`,
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              cursor: isLevelUnlocked(2) ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s ease',
              filter: isLevelUnlocked(2) ? 
                (isLevel2ButtonHovered ? 
                  'brightness(1.2) drop-shadow(0 0 10px rgba(255,255,255,0.6))' : 
                  'brightness(1) drop-shadow(0 0 3px rgba(0,0,0,0.3))') :
                (isLevel2ButtonHovered ? 
                  'brightness(0.7) grayscale(60%) drop-shadow(0 0 10px rgba(255,255,255,0.3))' :
                  'brightness(0.5) grayscale(80%) drop-shadow(0 0 3px rgba(0,0,0,0.3))'),
              transform: `scale(${isLevel2ButtonHovered && isLevelUnlocked(2) ? 1.1 : 1})`,
              zIndex: 10,
              opacity: isLevelUnlocked(2) ? 1 : 0.8
            }}
            onClick={isLevelUnlocked(2) ? onLevel2ButtonClick : undefined}
            onMouseEnter={isLevelUnlocked(2) ? onLevel2ButtonMouseEnter : undefined}
            onMouseLeave={isLevelUnlocked(2) ? onLevel2ButtonMouseLeave : undefined}
          />

          {/* Bouton Niveau 3 */}
          <div
            style={{
              width: `${MENU_BACKGROUND_WIDTH * 0.12}px`,
              height: `${MENU_BACKGROUND_WIDTH * 0.12 * 2}px`,
              backgroundImage: `url(${isLevelUnlocked(3) ? LEVEL3_BUTTON_UNLOCKED_URL : LEVEL3_BUTTON_LOCKED_URL})`,
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              cursor: isLevelUnlocked(3) ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s ease',
              filter: isLevelUnlocked(3) ? 
                (isLevel3ButtonHovered ? 
                  'brightness(1.2) drop-shadow(0 0 10px rgba(255,255,255,0.6))' : 
                  'brightness(1) drop-shadow(0 0 3px rgba(0,0,0,0.3))') :
                (isLevel3ButtonHovered ? 
                  'brightness(0.7) grayscale(60%) drop-shadow(0 0 10px rgba(255,255,255,0.3))' :
                  'brightness(0.5) grayscale(80%) drop-shadow(0 0 3px rgba(0,0,0,0.3))'),
              transform: `scale(${isLevel3ButtonHovered && isLevelUnlocked(3) ? 1.1 : 1})`,
              zIndex: 10,
              opacity: isLevelUnlocked(3) ? 1 : 0.8
            }}
            onClick={isLevelUnlocked(3) ? onLevel3ButtonClick : undefined}
            onMouseEnter={isLevelUnlocked(3) ? onLevel3ButtonMouseEnter : undefined}
            onMouseLeave={isLevelUnlocked(3) ? onLevel3ButtonMouseLeave : undefined}
          />
        </div>
      </div>

      {/* Bouton Retour */}
      <div
        style={{
          position: 'absolute',
          bottom: '30px',
          left: '50%',
          transform: 'translateX(-50%)',
          padding: `${Math.max(8, windowSize.height * 0.01)}px ${Math.max(16, windowSize.width * 0.015)}px`,
          backgroundColor: '#f44336',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: `${Math.max(12, windowSize.width * 0.012)}px`,
          fontWeight: 'bold',
          fontFamily: 'Arial, sans-serif',
          transition: 'all 0.2s ease',
          zIndex: 100
        }}
        onClick={onReturnToMenu}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#d32f2f';
          e.currentTarget.style.transform = 'translateX(-50%) scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#f44336';
          e.currentTarget.style.transform = 'translateX(-50%) scale(1)';
        }}
      >
        ← RETOUR
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
    </div>
  );
};

export default LevelSelect; 