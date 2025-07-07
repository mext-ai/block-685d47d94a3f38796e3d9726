import React from 'react';
import { Projectile as ProjectileType } from '../types';
import { DEVIL_PROJECTILE_URL, OBSERVER_PROJECTILE_URL } from '../constants';

interface ProjectileProps {
  projectile: ProjectileType;
}

const Projectile: React.FC<ProjectileProps> = ({ projectile }) => {
  // Calculer l'angle de rotation basé sur la direction du projectile
  const angle = Math.atan2(projectile.directionY, projectile.directionX) * (180 / Math.PI);
  
  const projectileUrl = projectile.sourceType === 'observer' ? OBSERVER_PROJECTILE_URL : DEVIL_PROJECTILE_URL;
  
  return (
    <div
      key={projectile.id}
      style={{
        position: 'absolute',
        left: `${projectile.x}%`,
        top: `${projectile.y}%`,
        transform: `translate(-50%, -50%) rotate(${angle}deg)`,
        width: '45px',
        height: '45px',
        backgroundImage: `url(${projectileUrl})`,
        backgroundSize: 'contain',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        imageRendering: 'pixelated',
        zIndex: 8
      }}
    />
  );
};

export default Projectile; 