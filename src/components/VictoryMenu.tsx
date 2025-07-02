import React from 'react';
import { VICTORY_BACKGROUND_URL, NEXT_LEVEL_BUTTON_URL, BACK_TO_LEVELS_BUTTON_URL } from '../constants';

interface VictoryMenuProps {
  onNextLevel: () => void;
  onBackToLevels: () => void;
  score: number;
  isLastLevel?: boolean;
}

const VictoryMenu: React.FC<VictoryMenuProps> = ({ onNextLevel, onBackToLevels, score, isLastLevel = false }) => {
  const getStars = () => {
    if (score >= 90) return 3;
    if (score >= 70) return 2;
    return 1;
  };

  const stars = getStars();

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        width: '90%',
        maxWidth: '600px',
        height: '80%',
        maxHeight: '500px',
        backgroundImage: `url(${VICTORY_BACKGROUND_URL})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        borderRadius: '20px',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>

        {/* Buttons positioned in the center, in a row */}
        <div style={{
          position: 'absolute',
          top: '65%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          marginTop: '0px',
          display: 'flex',
          flexDirection: 'row',
          gap: '0px',
          flexWrap: 'wrap',
          justifyContent: 'center',
          width: '70%',
        }}>
          <button
            onClick={onBackToLevels}
            style={{
              width: 'clamp(130px, 16vw, 180px)',
              height: 'clamp(62.5px, 7.8vh, 93.75px)',
              backgroundImage: `url(${BACK_TO_LEVELS_BUTTON_URL})`,
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: 'transparent',
              transition: 'transform 0.2s, filter 0.2s',
              minWidth: 'clamp(110px, 13vw, 150px)',
              flex: '0 0 auto',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.filter = 'brightness(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.filter = 'brightness(1)';
            }}
          />
          
          {!isLastLevel && (
            <button
              onClick={onNextLevel}
              style={{
                width: 'clamp(130px, 16vw, 180px)',
                height: 'clamp(62.5px, 7.8vh, 93.75px)',
                backgroundImage: `url(${NEXT_LEVEL_BUTTON_URL})`,
                backgroundSize: 'contain',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: 'transparent',
                transition: 'transform 0.2s, filter 0.2s',
                minWidth: 'clamp(110px, 13vw, 150px)',
                flex: '0 0 auto',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.filter = 'brightness(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.filter = 'brightness(1)';
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default VictoryMenu;