import React from 'react';
import { GameMode, Language } from '../types';
import { soundEngine } from '../utils/sound';
import { RotateCcw, Trophy, Sparkles, Home, Award } from 'lucide-react';
import confetti from 'canvas-confetti';

interface GameOverModalProps {
  isOpen: boolean;
  score: number;
  miceCaught: number;
  cheeseCollected: number;
  isNewHighScore: boolean;
  mode: GameMode;
  language: Language;
  onRestart: () => void;
  onClose: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  score,
  miceCaught,
  cheeseCollected,
  isNewHighScore,
  mode,
  language,
  onRestart,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#FDFCF0] text-[#4A3B2A] border-4 border-[#E9DCC9] rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative text-center">
        
        {/* Celebration Header */}
        <div className="w-20 h-20 bg-gradient-to-br from-[#8B9D77] to-[#7A8C66] rounded-3xl flex items-center justify-center text-4xl mx-auto mb-4 border-4 border-[#E9DCC9] shadow-xl animate-bounce">
          🐱
        </div>

        {isNewHighScore ? (
          <div className="bg-[#D68C7A] text-white font-black text-xs uppercase px-3 py-1 rounded-full w-max mx-auto mb-2 tracking-wider flex items-center space-x-1 shadow-md">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{language === 'th' ? 'สถิติใหม่สูงสุด!' : 'NEW HIGH SCORE!'}</span>
          </div>
        ) : (
          <div className="text-xs text-[#8B9D77] font-bold uppercase tracking-wider mb-1">
            {language === 'th' ? 'จบเกมจับหนู!' : 'GAME OVER'}
          </div>
        )}

        <h2 className="text-2xl sm:text-3xl font-black text-[#4A3B2A] mb-4">
          {language === 'th' ? 'ผลงานการล่าหนู' : 'Hunting Summary'}
        </h2>

        {/* Stats Grid */}
        <div className="bg-[#F4EFE6] border border-[#E5DAC8] rounded-2xl p-4 my-4 space-y-3 font-mono">
          <div className="flex justify-between items-center text-sm border-b border-[#E5DAC8] pb-2">
            <span className="text-[#7C6A58] font-sans font-bold">
              {language === 'th' ? 'คะแนนรวม:' : 'Final Score:'}
            </span>
            <span className="text-2xl font-black text-[#4A3B2A]">{score.toLocaleString()}</span>
          </div>

          <div className="flex justify-between items-center text-sm border-b border-[#E5DAC8] pb-2">
            <span className="text-[#7C6A58] font-sans font-bold">
              {language === 'th' ? 'จำนวนหนูที่จับได้:' : 'Mice Caught:'}
            </span>
            <span className="text-lg font-bold text-[#8B9D77]">🐭 {miceCaught}</span>
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="text-[#7C6A58] font-sans font-bold">
              {language === 'th' ? 'เนยแข็งที่สะสมได้:' : 'Cheese Earned:'}
            </span>
            <span className="text-lg font-bold text-[#D68C7A]">🧀 +{cheeseCollected}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3 mt-6">
          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="flex-1 py-3 bg-[#EFE8DA] hover:bg-[#E5DAC8] text-[#4A3B2A] font-bold text-sm rounded-2xl border border-[#D8C9B5] transition"
          >
            {language === 'th' ? 'หน้าหลัก' : 'Home'}
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              onRestart();
            }}
            className="flex-1 py-3 bg-[#8B9D77] hover:bg-[#7A8C66] text-white font-black text-sm rounded-2xl shadow-xl transition transform hover:scale-105 active:scale-95 flex items-center justify-center space-x-2"
          >
            <RotateCcw className="w-4 h-4 stroke-[3]" />
            <span>{language === 'th' ? 'เล่นอีกรอบ!' : 'PLAY AGAIN'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
