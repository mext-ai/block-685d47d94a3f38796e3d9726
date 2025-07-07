import React from 'react';

interface LevelButtonProps {
  level: number;
  isUnlocked: boolean;
  isHovered: boolean;
  buttonSize: number;
  onClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  getButtonUrl: (level: number, isUnlocked: boolean) => string;
}

const LevelButton: React.FC<LevelButtonProps> = ({
  level,
  isUnlocked,
  isHovered,
  buttonSize,
  onClick,
  onMouseEnter,
  onMouseLeave,
  getButtonUrl
}) => {
  const buttonStyle: React.CSSProperties = {
    width: `${buttonSize}px`,
    height: `${buttonSize * 2}px`,
    backgroundImage: `url(${getButtonUrl(level, isUnlocked)})`,
    backgroundSize: 'contain',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    cursor: isUnlocked ? 'pointer' : 'not-allowed',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    filter: isUnlocked ? 
      (isHovered ? 
        'brightness(1.3) drop-shadow(0 0 20px rgba(255,255,255,0.8))' : 
        'brightness(1) drop-shadow(0 0 8px rgba(0,0,0,0.4))') :
      (isHovered ? 
        'brightness(0.8) grayscale(40%) drop-shadow(0 0 15px rgba(255,255,255,0.4))' :
        'brightness(0.6) grayscale(60%) drop-shadow(0 0 5px rgba(0,0,0,0.4))'),
    transform: `scale(${isHovered && isUnlocked ? 1.15 : 1}) rotateY(${isHovered ? 5 : 0}deg)`,
    zIndex: isHovered ? 20 : 10,
    opacity: 1,
    position: 'relative'
  };

  return (
    <div
      style={buttonStyle}
      onClick={isUnlocked ? onClick : undefined}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Effet de brillance au hover */}
      {isHovered && isUnlocked && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)',
            animation: 'shine 0.6s ease-in-out',
            pointerEvents: 'none'
          }}
        />
      )}
    </div>
  );
};

export default LevelButton; 