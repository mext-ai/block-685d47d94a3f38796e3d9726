import React from 'react';
import { MENU_BACKGROUND_URL, PLAY_BUTTON_URL, SOUND_ON_BUTTON_URL, SOUND_OFF_BUTTON_URL } from '../constants';

interface MainMenuProps {
  isPlayButtonHovered: boolean;
  isSoundEnabled: boolean;
  hasGameProgress: boolean;
  progressPercentage: number;
  onPlayButtonClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  onPlayButtonMouseEnter: () => void;
  onPlayButtonMouseLeave: () => void;
  onContinueButtonClick: () => void;
  onResetProgressClick: () => void;
  onToggleSound: () => void;
  onForceStartMusic: () => void;
}

const MainMenu: React.FC<MainMenuProps> = ({
  isPlayButtonHovered,
  isSoundEnabled,
  hasGameProgress,
  progressPercentage,
  onPlayButtonClick,
  onPlayButtonMouseEnter,
  onPlayButtonMouseLeave,
  onContinueButtonClick,
  onResetProgressClick,
  onToggleSound,
  onForceStartMusic
}) => {
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
        backgroundColor: '#1a1a1a'
      }}
    >
      {/* Conteneur du bouton principal */}
      <div style={{
        position: 'absolute',
        left: '50%',
        top: '55%',
        transform: 'translate(-50%, -50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        zIndex: 10
      }}>
        {/* Bouton Jouer */}
        <div
          style={{
            transform: `scale(${isPlayButtonHovered ? 2.2 : 2})`,
            width: '180px',
            height: '90px',
            backgroundImage: `url(${PLAY_BUTTON_URL})`,
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            filter: isPlayButtonHovered ? 
              'brightness(1.2) drop-shadow(0 0 15px rgba(255,255,255,0.6)) saturate(1.2)' : 
              'brightness(1) drop-shadow(0 0 5px rgba(0,0,0,0.3))',
            opacity: isPlayButtonHovered ? 1 : 0.95,
          }}
          onClick={onPlayButtonClick}
          onMouseEnter={onPlayButtonMouseEnter}
          onMouseLeave={onPlayButtonMouseLeave}
        />
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
        onClick={(e) => {
          onForceStartMusic();
          onToggleSound();
        }}
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

export default MainMenu;