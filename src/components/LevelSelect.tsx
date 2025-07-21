import React, { useCallback } from 'react';
import {
  MENU_BACKGROUND_URL,
  LEVEL_MENU_BACKGROUND_URL,
  SOUND_ON_BUTTON_URL,
  SOUND_OFF_BUTTON_URL,
  PREVIOUS_ARROW_URL,
  NEXT_ARROW_URL,
  LEVEL1_BUTTON_URL,
  LEVEL2_BUTTON_LOCKED_URL,
  LEVEL2_BUTTON_UNLOCKED_URL,
  LEVEL3_BUTTON_LOCKED_URL,
  LEVEL3_BUTTON_UNLOCKED_URL,
  LEVEL4_BUTTON_LOCKED_URL,
  LEVEL4_BUTTON_UNLOCKED_URL,
  LEVEL5_BUTTON_LOCKED_URL,
  LEVEL5_BUTTON_UNLOCKED_URL,
  LEVEL6_BUTTON_LOCKED_URL,
  LEVEL6_BUTTON_UNLOCKED_URL,
  LEVEL7_BUTTON_LOCKED_URL,
  LEVEL7_BUTTON_UNLOCKED_URL,
  LEVEL8_BUTTON_LOCKED_URL,
  LEVEL8_BUTTON_UNLOCKED_URL,
  LEVEL9_BUTTON_LOCKED_URL,
  LEVEL9_BUTTON_UNLOCKED_URL,
  LEVEL_THEMES
} from '../constants';
import { useLevelCarousel } from '../hooks/useLevelCarousel';
import LevelButton from './LevelButton';

interface LevelSelectProps {
  windowSize: { width: number; height: number };
  isSoundEnabled: boolean;
  maxUnlockedLevel: number;
  completedLevels?: number[];
  isLevelUnlocked?: (level: number) => boolean;
  onLevelClick: (level: number) => void;
  onReturnToMenu: () => void;
  onToggleSound: () => void;
}

const LevelSelect: React.FC<LevelSelectProps> = ({
  windowSize,
  isSoundEnabled,
  maxUnlockedLevel,
  completedLevels = [],
  isLevelUnlocked: isLevelUnlockedProp,
  onLevelClick,
  onReturnToMenu,
  onToggleSound
}) => {
  const {
    carouselState,
    currentTheme,
    unlockedThemes,
    hoveredLevels,
    goToPreviousTheme,
    goToNextTheme,
    goToTheme,
    handleLevelHover,
    isLevelUnlocked: carouselIsLevelUnlocked,
    setCarouselState
  } = useLevelCarousel(maxUnlockedLevel);

  // Utiliser la fonction de vérification de niveau fournie par les props, ou celle du carrousel par défaut
  const isLevelUnlocked = useCallback((level: number) => {
    if (isLevelUnlockedProp) {
      return isLevelUnlockedProp(level);
    }
    return carouselIsLevelUnlocked(level);
  }, [isLevelUnlockedProp, carouselIsLevelUnlocked]);

  // Fonction pour vérifier si un niveau est complété
  const isLevelCompleted = useCallback((level: number) => {
    return completedLevels.includes(level);
  }, [completedLevels]);

  // Fonction pour obtenir l'URL du bouton selon le niveau et son état
  const getButtonUrl = useCallback((level: number, isUnlocked: boolean): string => {
    const buttonUrls: { [key: number]: { locked: string; unlocked: string } } = {
      1: { locked: LEVEL1_BUTTON_URL, unlocked: LEVEL1_BUTTON_URL },
      2: { locked: LEVEL2_BUTTON_LOCKED_URL, unlocked: LEVEL2_BUTTON_UNLOCKED_URL },
      3: { locked: LEVEL3_BUTTON_LOCKED_URL, unlocked: LEVEL3_BUTTON_UNLOCKED_URL },
      4: { locked: LEVEL4_BUTTON_LOCKED_URL, unlocked: LEVEL4_BUTTON_UNLOCKED_URL },
      5: { locked: LEVEL5_BUTTON_LOCKED_URL, unlocked: LEVEL5_BUTTON_UNLOCKED_URL },
      6: { locked: LEVEL6_BUTTON_LOCKED_URL, unlocked: LEVEL6_BUTTON_UNLOCKED_URL },
      7: { locked: LEVEL7_BUTTON_LOCKED_URL, unlocked: LEVEL7_BUTTON_UNLOCKED_URL },
      8: { locked: LEVEL8_BUTTON_LOCKED_URL, unlocked: LEVEL8_BUTTON_UNLOCKED_URL },
      9: { locked: LEVEL9_BUTTON_LOCKED_URL, unlocked: LEVEL9_BUTTON_UNLOCKED_URL }
    };

    return isUnlocked ? buttonUrls[level]?.unlocked || LEVEL1_BUTTON_URL : buttonUrls[level]?.locked || LEVEL1_BUTTON_URL;
  }, []);

  // Gestion du clic sur un niveau
  const handleLevelClick = useCallback((level: number) => {
    if (isLevelUnlocked(level)) {
      onLevelClick(level);
    }
  }, [isLevelUnlocked, onLevelClick]);

  // Calcul des dimensions
  const carouselWidth = Math.min(windowSize.width * 0.9, 900);
  const carouselHeight = Math.min(windowSize.height * 0.7, 500);
  const buttonSize = Math.min(carouselWidth * 0.12, 80);

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
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      {/* Bouton Retour au menu */}
      <div
        style={{
          position: 'fixed',
          top: '20px',
          left: '20px',
          padding: '12px 24px',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          border: '2px solid #ffffff',
          borderRadius: '10px',
          color: '#ffffff',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          textAlign: 'center',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
          fontFamily: 'Arial, sans-serif',
          textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
          zIndex: 1000
        }}
        onClick={onReturnToMenu}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(50, 50, 50, 0.9)';
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 255, 255, 0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.3)';
        }}
      >
        ← Menu Principal
      </div>

      {/* Indicateur de progression si completedLevels est fourni */}
      {completedLevels.length > 0 && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '10px 20px',
            backgroundColor: 'rgba(0, 100, 0, 0.8)',
            border: '2px solid #00ff00',
            borderRadius: '8px',
            color: '#ffffff',
            fontSize: '14px',
            fontWeight: 'bold',
            textAlign: 'center',
            boxShadow: '0 4px 15px rgba(0, 255, 0, 0.3)',
            fontFamily: 'Arial, sans-serif',
            textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
            zIndex: 1000
          }}
        >
          Progression: {completedLevels.length}/21 niveaux
        </div>
      )}

      {/* Carrousel principal avec cadre de menu */}
      <div
        style={{
          width: `${carouselWidth}px`,
          height: `${carouselHeight}px`,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden'
        }}
      >
        {/* Bouton de navigation gauche */}
        <button
          onClick={goToPreviousTheme}
          disabled={carouselState.isTransitioning}
          style={{
            position: 'absolute',
            left: '45px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            border: 'none',
            backgroundColor: 'transparent',
            backgroundImage: `url(${PREVIOUS_ARROW_URL})`,
            backgroundSize: '60%',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            cursor: carouselState.isTransitioning ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            zIndex: 50
          }}
          onMouseEnter={(e) => {
            if (!carouselState.isTransitioning) {
              e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
          }}
        />

        {/* Cadre de menu avec image de thème à l'intérieur */}
        <div
          style={{
            width: '100%',
            height: '100%',
            backgroundImage: `url(${LEVEL_MENU_BACKGROUND_URL})`,
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
            transform: carouselState.isTransitioning ? 
              `translateX(${carouselState.direction === 'left' ? '-100%' : '100%'})` : 
              'translateX(0)',
            zIndex: 10
          }}
        >
          {/* Image de fond du thème à l'intérieur du cadre */}
          <div
            style={{
              position: 'absolute',
              top: '27.6%',
              left: '28%',
              right: '28%',
              bottom: '27.2%',
              backgroundImage: `url(${currentTheme.backgroundImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              borderRadius: '15px',
              opacity: 1,
              zIndex: 1
            }}
          />

          {/* Contenu du thème */}
          <div
            style={{
              position: 'relative',
              zIndex: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
              padding: '40px'
            }}
          >
            {/* Conteneur des boutons de niveau */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '60px',
                flexWrap: 'wrap',
                maxWidth: '100%'
              }}
            >
              {currentTheme.levels.map((level) => {
                const levelUnlocked = isLevelUnlocked(level);
                const levelCompleted = isLevelCompleted(level);
                
                return (
                  <div key={level} style={{ position: 'relative' }}>
                    <LevelButton
                      level={level}
                      isUnlocked={levelUnlocked}
                      isHovered={hoveredLevels[level] || false}
                      buttonSize={buttonSize}
                      onClick={() => handleLevelClick(level)}
                      onMouseEnter={() => handleLevelHover(level, true)}
                      onMouseLeave={() => handleLevelHover(level, false)}
                      getButtonUrl={getButtonUrl}
                    />
                    
                    {/* Indicateur de niveau complété */}
                    {levelCompleted && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '-5px',
                          right: '-5px',
                          width: '20px',
                          height: '20px',
                          backgroundColor: '#00ff00',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          color: '#000000',
                          fontWeight: 'bold',
                          boxShadow: '0 2px 8px rgba(0, 255, 0, 0.5)',
                          zIndex: 10
                        }}
                      >
                        ✓
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bouton de navigation droite */}
        <button
          onClick={goToNextTheme}
          disabled={carouselState.isTransitioning}
          style={{
            position: 'absolute',
            right: '45px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            border: 'none',
            backgroundColor: 'transparent',
            backgroundImage: `url(${NEXT_ARROW_URL})`,
            backgroundSize: '60%',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            cursor: carouselState.isTransitioning ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            zIndex: 50
          }}
          onMouseEnter={(e) => {
            if (!carouselState.isTransitioning) {
              e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
          }}
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
          transition: 'all 0.3s ease',
          filter: isSoundEnabled ? 'brightness(1)' : 'brightness(0.5) grayscale(100%)',
          transform: 'scale(1)',
          borderRadius: '50%',
          boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
        }}
        onClick={onToggleSound}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.filter = isSoundEnabled ? 
            'brightness(1.2) drop-shadow(0 0 15px rgba(255,255,255,0.8))' : 
            'brightness(0.7) grayscale(100%) drop-shadow(0 0 15px rgba(255,255,255,0.8))';
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