import React from 'react';
import { GAME_OVER_BACKGROUND_URL, RESTART_BUTTON_URL, BACK_TO_LEVELS_BUTTON_URL } from '../constants';

interface DefeatMenuProps {
  onRestart: () => void;
  onBackToLevels: () => void;
}

const DefeatMenu: React.FC<DefeatMenuProps> = ({ onRestart, onBackToLevels }) => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        position: 'relative',
        width: '400px',
        height: '300px',
        backgroundImage: `url(${GAME_OVER_BACKGROUND_URL})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        borderRadius: '15px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
      }}>
        {/* Skulls decoration */}
        <div style={{
          position: 'absolute',
          top: '15%',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '20px',
        }}>
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              style={{
                width: '30px',
                height: '30px',
                background: '#8B0000',
                borderRadius: '50%',
                opacity: 0.8,
              }}
            />
          ))}
        </div>

        {/* Buttons container */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          marginTop: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '15px',
          alignItems: 'center',
        }}>
          <button
            onClick={onRestart}
            style={{
              width: '180px',
              height: '50px',
              backgroundImage: `url(${RESTART_BUTTON_URL})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              border: 'none',
              cursor: 'pointer',
              transition: 'transform 0.2s',
              backgroundColor: 'transparent',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          />
          
          <button
            onClick={onBackToLevels}
            style={{
              width: '180px',
              height: '50px',
              backgroundImage: `url(${BACK_TO_LEVELS_BUTTON_URL})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              border: 'none',
              cursor: 'pointer',
              transition: 'transform 0.2s',
              backgroundColor: 'transparent',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default DefeatMenu;