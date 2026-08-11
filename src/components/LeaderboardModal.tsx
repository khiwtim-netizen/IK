import React from 'react';
import { GameStats, Language } from '../types';
import { X, Trophy, Flame, Compass, ShieldAlert, Clock, Star } from 'lucide-react';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: GameStats;
  language: Language;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  stats,
  language,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#FDFCF0] text-[#4A3B2A] border-4 border-[#E9DCC9] rounded-3xl max-w-lg w-full p-5 sm:p-7 shadow-2xl relative">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E9DCC9]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#8B9D77]/20 flex items-center justify-center text-2xl border border-[#8B9D77]/40">
              🏆
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#4A3B2A]">
                {language === 'th' ? 'สถิติ & คะแนนสูงสุด' : 'High Scores & Stats'}
              </h2>
              <p className="text-xs text-[#7C6A58]">
                {language === 'th' ? 'เกียรติยศยอดนักจับหนูประจำเครื่อง' : 'Your personal hall of fame'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-2xl bg-[#EFE8DA] hover:bg-[#E5DAC8] text-[#4A3B2A] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* High Scores By Mode */}
        <div className="space-y-3 my-5">
          <h3 className="text-xs font-bold text-[#8B9D77] uppercase tracking-wider">
            {language === 'th' ? 'คะแนนสูงสุดแต่ละโหมด' : 'Best Scores by Mode'}
          </h3>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-[#F4EFE6] p-3.5 rounded-2xl border border-[#E5DAC8] flex flex-col justify-between">
              <div className="flex items-center space-x-1.5 text-xs text-[#7C6A58] font-bold mb-1">
                <Flame className="w-4 h-4 text-[#D68C7A]" />
                <span>{language === 'th' ? 'อาเขต' : 'Arcade'}</span>
              </div>
              <div className="text-xl font-black font-mono text-[#4A3B2A]">
                {stats.highScoreArcade.toLocaleString()}
              </div>
            </div>

            <div className="bg-[#F4EFE6] p-3.5 rounded-2xl border border-[#E5DAC8] flex flex-col justify-between">
              <div className="flex items-center space-x-1.5 text-xs text-[#7C6A58] font-bold mb-1">
                <Compass className="w-4 h-4 text-[#8B9D77]" />
                <span>{language === 'th' ? 'เขาวงกต' : 'Kitchen Maze'}</span>
              </div>
              <div className="text-xl font-black font-mono text-[#4A3B2A]">
                {stats.highScoreMaze.toLocaleString()}
              </div>
            </div>

            <div className="bg-[#F4EFE6] p-3.5 rounded-2xl border border-[#E5DAC8] flex flex-col justify-between">
              <div className="flex items-center space-x-1.5 text-xs text-[#7C6A58] font-bold mb-1">
                <ShieldAlert className="w-4 h-4 text-[#C87A68]" />
                <span>{language === 'th' ? 'หนูหนีแมว' : 'Mouse Escape'}</span>
              </div>
              <div className="text-xl font-black font-mono text-[#4A3B2A]">
                {stats.highScoreMouseEscape.toLocaleString()}
              </div>
            </div>

            <div className="bg-[#F4EFE6] p-3.5 rounded-2xl border border-[#E5DAC8] flex flex-col justify-between">
              <div className="flex items-center space-x-1.5 text-xs text-[#7C6A58] font-bold mb-1">
                <Clock className="w-4 h-4 text-[#B89658]" />
                <span>{language === 'th' ? 'จับเวลา 60s' : 'Time Trial'}</span>
              </div>
              <div className="text-xl font-black font-mono text-[#4A3B2A]">
                {stats.highScoreTimeAttack.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Lifetime Statistics */}
          <h3 className="text-xs font-bold text-[#8B9D77] uppercase tracking-wider pt-3">
            {language === 'th' ? 'สถิติตลอดกาล' : 'Lifetime Statistics'}
          </h3>

          <div className="bg-[#F4EFE6] p-4 rounded-2xl border border-[#E5DAC8] space-y-2 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-[#7C6A58] font-sans">{language === 'th' ? 'จับหนูรวมทั้งหมด:' : 'Total Mice Caught:'}</span>
              <span className="text-[#4A3B2A] font-bold">🐭 {stats.totalMiceCaught}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#7C6A58] font-sans">{language === 'th' ? 'สะสมเนยแข็งรวม:' : 'Total Cheese Collected:'}</span>
              <span className="text-[#4A3B2A] font-bold">🧀 {stats.totalCheeseCollected}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#7C6A58] font-sans">{language === 'th' ? 'ใช้งานแคทนิปไปแล้ว:' : 'Catnip Frenzies:'}</span>
              <span className="text-[#4A3B2A] font-bold">🌿 {stats.catnipUsed}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#7C6A58] font-sans">{language === 'th' ? 'จำนวนเกมที่เล่น:' : 'Total Games Played:'}</span>
              <span className="text-[#4A3B2A] font-bold">🎮 {stats.gamesPlayed}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
