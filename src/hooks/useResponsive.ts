import { useState, useEffect } from 'react';
import { WindowSize } from '../types';
import { BASE_SPRITE_SCALE, BASE_ENEMY_SPRITE_SCALE, BASE_TREANT_SPRITE_SCALE } from '../constants';

export const useResponsive = () => {
  const [windowSize, setWindowSize] = useState<WindowSize>({ width: window.innerWidth, height: window.innerHeight });
  const [spriteScale, setSpriteScale] = useState(BASE_SPRITE_SCALE);
  const [enemySpriteScale, setEnemySpriteScale] = useState(BASE_ENEMY_SPRITE_SCALE);
  const [treantSpriteScale, setTreantSpriteScale] = useState(BASE_TREANT_SPRITE_SCALE);

  // Écouter les changements de taille de fenêtre
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Recalculer les échelles quand la taille de fenêtre change
  useEffect(() => {
    calculateResponsiveScale();
  }, [windowSize]);

  const calculateResponsiveScale = () => {
    const baseWidth = 1920; // Largeur de référence
    const baseHeight = 1080; // Hauteur de référence
    const minScale = 2.25; // Taille minimale x1.5 (1.5 x 1.5 = 2.25)
    const maxScale = 9; // Taille maximale x1.5 (6 x 1.5 = 9)
    
    // Calculer le facteur d'échelle basé sur la taille de l'écran
    const widthRatio = windowSize.width / baseWidth;
    const heightRatio = windowSize.height / baseHeight;
    
    // Utiliser le ratio le plus petit pour éviter que les sprites sortent de l'écran
    const scaleRatio = Math.min(widthRatio, heightRatio);
    
    const newPlayerScale = Math.max(minScale, Math.min(maxScale, BASE_SPRITE_SCALE * scaleRatio));
    const newEnemyScale = Math.max(minScale * 0.8, Math.min(maxScale * 0.8, BASE_ENEMY_SPRITE_SCALE * scaleRatio));
    const newTreantScale = Math.max(minScale * 1.5, Math.min(maxScale * 1.5, BASE_TREANT_SPRITE_SCALE * scaleRatio));
    
    setSpriteScale(newPlayerScale);
    setEnemySpriteScale(newEnemyScale);
    setTreantSpriteScale(newTreantScale);
  };

  return {
    windowSize,
    spriteScale,
    enemySpriteScale,
    treantSpriteScale
  };
}; 