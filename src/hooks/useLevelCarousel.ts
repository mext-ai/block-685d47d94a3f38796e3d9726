import { useState, useCallback } from 'react';
import { CarouselState, LevelTheme } from '../types';
import { LEVEL_THEMES } from '../constants';

export const useLevelCarousel = (maxUnlockedLevel: number) => {
  const [carouselState, setCarouselState] = useState<CarouselState>({
    currentThemeIndex: 0,
    isTransitioning: false,
    direction: null
  });

  const [hoveredLevels, setHoveredLevels] = useState<{ [key: number]: boolean }>({});

  // Déterminer quels thèmes sont débloqués
  const getUnlockedThemes = useCallback(() => {
    return LEVEL_THEMES.map(theme => ({
      ...theme,
      isUnlocked: theme.levels.some(level => level <= maxUnlockedLevel)
    }));
  }, [maxUnlockedLevel]);

  // Navigation vers le thème précédent
  const goToPreviousTheme = useCallback(() => {
    if (carouselState.isTransitioning) return;
    
    setCarouselState(prev => ({
      ...prev,
      isTransitioning: true,
      direction: 'left'
    }));

    setTimeout(() => {
      setCarouselState(prev => ({
        currentThemeIndex: prev.currentThemeIndex === 0 ? LEVEL_THEMES.length - 1 : prev.currentThemeIndex - 1,
        isTransitioning: false,
        direction: null
      }));
    }, 300);
  }, [carouselState.isTransitioning]);

  // Navigation vers le thème suivant
  const goToNextTheme = useCallback(() => {
    if (carouselState.isTransitioning) return;
    
    setCarouselState(prev => ({
      ...prev,
      isTransitioning: true,
      direction: 'right'
    }));

    setTimeout(() => {
      setCarouselState(prev => ({
        currentThemeIndex: (prev.currentThemeIndex + 1) % LEVEL_THEMES.length,
        isTransitioning: false,
        direction: null
      }));
    }, 300);
  }, [carouselState.isTransitioning]);

  // Navigation vers un thème spécifique
  const goToTheme = useCallback((targetIndex: number) => {
    if (carouselState.isTransitioning || targetIndex === carouselState.currentThemeIndex) return;
    
    setCarouselState(prev => ({
      ...prev,
      isTransitioning: true,
      direction: targetIndex < prev.currentThemeIndex ? 'left' : 'right'
    }));

    setTimeout(() => {
      setCarouselState(prev => ({
        currentThemeIndex: targetIndex,
        isTransitioning: false,
        direction: null
      }));
    }, 300);
  }, [carouselState.isTransitioning, carouselState.currentThemeIndex]);

  // Gestion du hover des niveaux
  const handleLevelHover = useCallback((level: number, isHovered: boolean) => {
    setHoveredLevels(prev => ({
      ...prev,
      [level]: isHovered
    }));
  }, []);

  // Vérifier si un niveau est débloqué
  const isLevelUnlocked = useCallback((level: number) => {
    return level <= maxUnlockedLevel;
  }, [maxUnlockedLevel]);

  // Obtenir le thème actuel
  const currentTheme = LEVEL_THEMES[carouselState.currentThemeIndex];

  return {
    carouselState,
    currentTheme,
    unlockedThemes: getUnlockedThemes(),
    hoveredLevels,
    goToPreviousTheme,
    goToNextTheme,
    goToTheme,
    handleLevelHover,
    isLevelUnlocked,
    setCarouselState
  };
}; 