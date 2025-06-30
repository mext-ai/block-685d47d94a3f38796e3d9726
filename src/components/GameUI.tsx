import React from 'react';

interface GameUIProps {
  score: number;
  level: number;
  playerHealth: number;
  gameTime: number;
  gameState: 'menu' | 'playing' | 'paused' | 'gameover';
}

export const GameUI: React.FC<GameUIProps> = ({
  score,
  level,
  playerHealth,
  gameTime,
  gameState
}) => {
  if (gameState !== 'playing') return null;

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getHealthBarColor = (health: number): string => {
    if (health > 60) return '#4ade80'; // vert
    if (health > 30) return '#fbbf24'; // jaune
    return '#ef4444'; // rouge
  };

  return (
    <div className="game-ui">
      {/* Barre d'informations supérieure */}
      <div className="ui-top-bar">
        <div className="ui-stat">
          <span className="ui-label">Score</span>
          <span className="ui-value">{score.toLocaleString()}</span>
        </div>
        
        <div className="ui-stat">
          <span className="ui-label">Niveau</span>
          <span className="ui-value">{level}</span>
        </div>
        
        <div className="ui-stat">
          <span className="ui-label">Temps</span>
          <span className="ui-value">{formatTime(gameTime)}</span>
        </div>
      </div>

      {/* Barre de santé */}
      <div className="ui-health-container">
        <div className="ui-health-label">Santé</div>
        <div className="ui-health-bar">
          <div 
            className="ui-health-fill"
            style={{
              width: `${playerHealth}%`,
              backgroundColor: getHealthBarColor(playerHealth)
            }}
          />
          <span className="ui-health-text">{playerHealth}/100</span>
        </div>
      </div>

      {/* Instructions */}
      <div className="ui-instructions">
        <p>🎮 WASD ou flèches pour se déplacer</p>
        <p>🎯 Clic pour tirer</p>
      </div>

      <style jsx>{`
        .game-ui {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          pointer-events: none;
          font-family: 'Courier New', monospace;
        }

        .ui-top-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          background: linear-gradient(
            to bottom,
            rgba(0, 0, 0, 0.8),
            rgba(0, 0, 0, 0.4),
            transparent
          );
        }

        .ui-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          color: white;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
        }

        .ui-label {
          font-size: 12px;
          color: #94a3b8;
          margin-bottom: 2px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .ui-value {
          font-size: 18px;
          font-weight: bold;
          color: #00ff88;
          text-shadow: 0 0 10px rgba(0, 255, 136, 0.5);
        }

        .ui-health-container {
          position: absolute;
          top: 80px;
          left: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .ui-health-label {
          color: white;
          font-size: 14px;
          font-weight: bold;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
          min-width: 50px;
        }

        .ui-health-bar {
          position: relative;
          width: 200px;
          height: 20px;
          background: rgba(0, 0, 0, 0.8);
          border: 2px solid #334155;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .ui-health-fill {
          height: 100%;
          transition: all 0.3s ease;
          border-radius: 6px;
          box-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
        }

        .ui-health-text {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: bold;
          color: white;
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
        }

        .ui-instructions {
          position: absolute;
          bottom: 20px;
          right: 20px;
          background: rgba(0, 0, 0, 0.8);
          padding: 15px;
          border-radius: 8px;
          border: 1px solid #334155;
        }

        .ui-instructions p {
          margin: 5px 0;
          color: #94a3b8;
          font-size: 12px;
          text-align: right;
        }

        @media (max-width: 768px) {
          .ui-top-bar {
            padding: 15px;
            flex-wrap: wrap;
            gap: 10px;
          }

          .ui-stat {
            min-width: 80px;
          }

          .ui-health-container {
            top: 90px;
            left: 15px;
          }

          .ui-health-bar {
            width: 150px;
            height: 18px;
          }

          .ui-instructions {
            bottom: 15px;
            right: 15px;
            padding: 10px;
          }

          .ui-instructions p {
            font-size: 11px;
          }
        }
      `}</style>
    </div>
  );
};