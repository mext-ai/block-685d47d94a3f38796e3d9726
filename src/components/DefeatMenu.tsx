import React from 'react';
import {
  GAME_OVER_BACKGROUND_URL,
  BACK_TO_LEVELS_BUTTON_URL,
  RESTART_BUTTON_URL
} from '../constants';

interface DefeatMenuProps {
  onBackToLevels: () => void;
  onRestart: () => void;
}

const DefeatMenu: React.FC<DefeatMenuProps> = ({
  onBackToLevels,
  onRestart
}) => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      backgroundColor: 'transparent'
    }}>
      {/* Modale de défaite */}
      <div style={{
        width: '40%',
        height: '40%',
        backgroundImage: `url(${GAME_OVER_BACKGROUND_URL})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: '15px',
        paddingBottom: '12%'
      }}>
        
        {/* Boutons */}
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          gap: '15px',
          alignItems: 'center'
        }}>
          {/* Bouton Retour aux niveaux */}
          <div
            style={{
              width: '150px',
              height: '67px',
              backgroundImage: `url(${BACK_TO_LEVELS_BUTTON_URL})`,
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              transform: 'scale(1)'
            }}
            onClick={onBackToLevels}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.filter = 'brightness(1.2) drop-shadow(0 0 15px rgba(255,255,255,0.8))';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.filter = 'brightness(1)';
            }}
          />

          {/* Bouton Recommencer */}
          <div
            style={{
              width: '150px',
              height: '67px',
              backgroundImage: `url(${RESTART_BUTTON_URL})`,
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              transform: 'scale(1)'
            }}
            onClick={onRestart}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.filter = 'brightness(1.2) drop-shadow(0 0 15px rgba(255,255,255,0.8))';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.filter = 'brightness(1)';
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default DefeatMenu; 