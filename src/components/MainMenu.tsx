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
      {/* Conteneur des boutons principaux */}
      <div style={{
        position: 'absolute',
        left: '50%',
        top: '55%',
        transform: 'translate(-50%, -50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: hasGameProgress ? '20px' : '0px',
        zIndex: 10
      }}>
        {/* Bouton Continuer (affiché seulement si progression sauvegardée) */}
        {hasGameProgress && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px'
          }}>
            <div
              style={{
                padding: '15px 30px',
                backgroundColor: 'rgba(0, 100, 0, 0.8)',
                border: '3px solid #00ff00',
                borderRadius: '10px',
                color: '#ffffff',
                fontSize: '20px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                textAlign: 'center',
                boxShadow: '0 4px 15px rgba(0, 255, 0, 0.3)',
                fontFamily: 'Arial, sans-serif',
                textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
                minWidth: '200px'
              }}
              onClick={onContinueButtonClick}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(0, 150, 0, 0.9)';
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 255, 0, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(0, 100, 0, 0.8)';
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 255, 0, 0.3)';
              }}
            >
              CONTINUER
            </div>
            
            {/* Indicateur de progression */}
            <div style={{
              color: '#ffffff',
              fontSize: '14px',
              textAlign: 'center',
              textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
              fontFamily: 'Arial, sans-serif'
            }}>
              Progression: {progressPercentage}%
            </div>
          </div>
        )}

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
          onClick={(e) => {
            onPlayButtonClick(e);
          }}
          onMouseEnter={onPlayButtonMouseEnter}
          onMouseLeave={onPlayButtonMouseLeave}
        />
        
        {/* Texte explicatif sous le bouton Jouer */}
        {hasGameProgress && (
          <div style={{
            color: '#cccccc',
            fontSize: '12px',
            textAlign: 'center',
            textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
            fontFamily: 'Arial, sans-serif',
            maxWidth: '250px'
          }}>
            (Nouveau jeu / Sélection de niveau)
          </div>
        )}
      </div>

      {/* Bouton de réinitialisation (affiché seulement si progression sauvegardée) */}
      {hasGameProgress && (
        <div
          style={{
            position: 'fixed',
            bottom: '20px',
            left: '20px',
            padding: '10px 15px',
            backgroundColor: 'rgba(150, 0, 0, 0.8)',
            border: '2px solid #ff4444',
            borderRadius: '8px',
            color: '#ffffff',
            fontSize: '12px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            textAlign: 'center',
            boxShadow: '0 2px 10px rgba(255, 0, 0, 0.3)',
            fontFamily: 'Arial, sans-serif',
            textShadow: '1px 1px 2px rgba(0,0,0,0.7)',
            zIndex: 1000
          }}
          onClick={(e) => {
            if (window.confirm('Êtes-vous sûr de vouloir réinitialiser toute votre progression ?')) {
              onResetProgressClick();
            }
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(200, 0, 0, 0.9)';
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(255, 0, 0, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(150, 0, 0, 0.8)';
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 2px 10px rgba(255, 0, 0, 0.3)';
          }}
        >
          🗑️ RESET
        </div>
      )}

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