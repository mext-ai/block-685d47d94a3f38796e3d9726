import React from 'react';
import {
  VICTORY_BACKGROUND_URL,
  BACK_TO_LEVELS_BUTTON_URL,
  NEXT_LEVEL_BUTTON_URL
} from '../constants';

interface VictoryMenuProps {
  onBackToLevels: () => void;
  onNextLevel: () => void;
  currentLevel: number;
}

const VictoryMenu: React.FC<VictoryMenuProps> = ({
  onBackToLevels,
  onNextLevel,
  currentLevel
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
      {/* Modale de victoire */}
      <div style={{
        width: '40%',
        height: '40%',
        backgroundImage: `url(${VICTORY_BACKGROUND_URL})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative'
      }}>
        
        {/* Boutons - positionnés au centre de la modale */}
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          gap: '15px',
          alignItems: 'center',
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          marginTop: '20px' // Léger décalage vers le bas pour éviter le texte de victoire
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

          {/* Bouton Niveau suivant */}
          <div
            style={{
              width: '150px',
              height: '67px',
              backgroundImage: `url(${NEXT_LEVEL_BUTTON_URL})`,
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              transform: 'scale(1)'
            }}
            onClick={onNextLevel}
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

export default VictoryMenu;