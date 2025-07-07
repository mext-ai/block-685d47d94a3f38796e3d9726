import { useState, useEffect } from 'react';
import { calculateResponsiveScale } from '../utils/gameUtils';

export const useResponsiveScales = () => {
  const [spriteScale, setSpriteScale] = useState(5.25);
  const [enemySpriteScale, setEnemySpriteScale] = useState(4.5);
  const [treantSpriteScale, setTreantSpriteScale] = useState(9);
  const [devilSpriteScale, setDevilSpriteScale] = useState(6);
  const [goblinSpriteScale, setGoblinSpriteScale] = useState(4);

  // Recalculer les échelles quand la taille de fenêtre change
  useEffect(() => {
    const updateScales = () => {
      const scales = calculateResponsiveScale({ width: window.innerWidth, height: window.innerHeight });
      setSpriteScale(scales.playerScale);
      setEnemySpriteScale(scales.enemyScale);
      setTreantSpriteScale(scales.treantScale);
      setDevilSpriteScale(scales.enemyScale * 1.3); // Diables légèrement plus grands que les champignons
      setGoblinSpriteScale(scales.enemyScale * 0.9); // Gobelins légèrement plus petits que les champignons
    };

    updateScales();
    window.addEventListener('resize', updateScales);

    return () => window.removeEventListener('resize', updateScales);
  }, []);

  return {
    spriteScale,
    enemySpriteScale,
    treantSpriteScale,
    devilSpriteScale,
    goblinSpriteScale
  };
}; 