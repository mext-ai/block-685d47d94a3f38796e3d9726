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
        'brightness(1.3)' : 
        'brightness(1)') :
      (isHovered ? 
        'brightness(0.8) grayscale(40%)' :
        'brightness(0.6) grayscale(60%)'),
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
    />
  );
};

export default LevelButton; 