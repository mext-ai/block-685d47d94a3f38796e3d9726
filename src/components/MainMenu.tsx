import React from 'react';
import { useGameState } from '../hooks/useGameState';

export const MainMenu: React.FC = () => {
  const { goToLevelSelect, resetGameProgress, hasGameProgress, getProgressPercentage } = useGameState();

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="text-center p-8 bg-black/30 rounded-2xl backdrop-blur-sm border border-white/20">
        <h1 className="text-6xl font-bold text-white mb-4 drop-shadow-2xl">
          Dungeon <span className="text-yellow-400">Crawler</span>
        </h1>
        
        <p className="text-xl text-gray-300 mb-8 max-w-md mx-auto">
          Survivez aux vagues d'ennemis dans ce donjon mystérieux
        </p>

        {hasGameProgress() && (
          <div className="mb-6 p-4 bg-green-900/30 rounded-lg border border-green-500/30">
            <p className="text-green-300 text-sm mb-2">Progression sauvegardée</p>
            <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${getProgressPercentage()}%` }}
              />
            </div>
            <p className="text-green-200 text-xs">{getProgressPercentage()}% complété</p>
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={goToLevelSelect}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xl font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-xl w-48"
          >
            Jouer
          </button>

          {hasGameProgress() && (
            <div className="pt-4 border-t border-white/20">
              <button
                onClick={resetGameProgress}
                className="px-6 py-2 bg-red-600/20 text-red-300 text-sm font-medium rounded-lg hover:bg-red-600/30 border border-red-500/30 transition-all duration-200"
              >
                Réinitialiser la progression
              </button>
            </div>
          )}
        </div>

        <div className="mt-8 text-gray-400 text-sm">
          <p>Utilisez WASD ou les flèches pour vous déplacer</p>
          <p>Cliquez pour attaquer</p>
        </div>
      </div>
    </div>
  );
};