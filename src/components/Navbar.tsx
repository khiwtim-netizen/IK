import React from 'react';
import { GameMode, Language } from '../types';
import { CAT_SKINS } from '../utils/storage';
import { Volume2, VolumeX, Trophy, Shirt, Compass, Info, Award, ShieldAlert, Sparkles, Flame, Clock, Gamepad2 } from 'lucide-react';

interface NavbarProps {
  currentMode: GameMode;
  onSelectMode: (mode: GameMode) => void;
  selectedSkinId: string;
  onOpenSkinsModal: () => void;
  onOpenAchievementsModal: () => void;
  onOpenLeaderboardModal: () => void;
  onOpenHelpModal: () => void;
  cheeseCount: number;
  isMuted: boolean;
  onToggleMute: () => void;
  language: Language;
  onToggleLanguage: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentMode,
  onSelectMode,
  selectedSkinId,
  onOpenSkinsModal,
  onOpenAchievementsModal,
  onOpenLeaderboardModal,
  onOpenHelpModal,
  cheeseCount,
  isMuted,
  onToggleMute,
  language,
  onToggleLanguage,
}) => {
  const currentSkin = CAT_SKINS.find(s => s.id === selectedSkinId) || CAT_SKINS[0];

  const modes: { id: GameMode; labelTh: string; labelEn: string; icon: React.ReactNode; descTh: string }[] = [
    {
      id: 'arcade',
      labelTh: 'ไล่จับหนูอาเขต',
      labelEn: 'Arcade Chase',
      icon: <Flame className="w-4 h-4 text-orange-500" />,
      descTh: 'จับหนูเร็วให้ได้มากที่สุด!',
    },
    {
      id: 'maze',
      labelTh: 'เขาวงกตห้องครัว',
      labelEn: 'Kitchen Maze',
      icon: <Compass className="w-4 h-4 text-emerald-500" />,
      descTh: 'สำรวจเขาวงกต หลบหมาตัวร้าย!',
    },
    {
      id: 'mouse_escape',
      labelTh: 'หนูน้อยหลบแมว',
      labelEn: 'Mouse Escape',
      icon: <ShieldAlert className="w-4 h-4 text-rose-500" />,
      descTh: 'เล่นเป็นหนู เก็บเนยหลบแมว!',
    },
    {
      id: 'time_attack',
      labelTh: 'แข่งจับหนูจับเวลา',
      labelEn: 'Time Trial 60s',
      icon: <Clock className="w-4 h-4 text-amber-500" />,
      descTh: 'ทำคะแนนสูงสุดใน 60 วินาที!',
    },
  ];

  return (
    <header className="bg-amber-900/90 text-amber-50 backdrop-blur-md border-b-4 border-amber-700 shadow-xl sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Title & Brand */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-2xl shadow-inner border-2 border-amber-200 animate-pulse">
              🐱
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight bg-gradient-to-r from-amber-200 via-orange-300 to-amber-100 bg-clip-text text-transparent drop-shadow-sm">
                {language === 'th' ? 'เกมแมวกินหนู' : 'Cat Catch Mouse'}
              </h1>
              <p className="text-xs text-amber-300 font-medium hidden sm:block">
                {language === 'th' ? 'แอกชันจับหนูสุดมันส์ 🐾' : 'Action Arcade Pursuit Game 🐾'}
              </p>
            </div>
          </div>

          {/* Quick Actions (Mobile visible) */}
          <div className="flex items-center space-x-1.5 md:hidden">
            <button
              onClick={onToggleMute}
              className="p-2 rounded-xl bg-amber-950/60 hover:bg-amber-800 border border-amber-700 text-amber-200 transition"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>
            <button
              onClick={onToggleLanguage}
              className="px-2.5 py-1 text-xs font-bold rounded-xl bg-amber-800 hover:bg-amber-700 border border-amber-600 text-amber-200"
            >
              {language === 'th' ? 'TH 🇹🇭' : 'EN 🇬🇧'}
            </button>
          </div>
        </div>

        {/* Game Mode Selector Tabs */}
        <div className="flex items-center overflow-x-auto w-full md:w-auto max-w-full pb-1 md:pb-0 gap-1.5 scrollbar-none">
          {modes.map(mode => {
            const isActive = currentMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => onSelectMode(mode.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 border ${
                  isActive
                    ? 'bg-amber-500 text-amber-950 border-amber-300 shadow-md scale-105'
                    : 'bg-amber-950/50 hover:bg-amber-800/80 border-amber-800/80 text-amber-200 hover:text-white'
                }`}
              >
                {mode.icon}
                <span>{language === 'th' ? mode.labelTh : mode.labelEn}</span>
              </button>
            );
          })}
        </div>

        {/* Status Badges & Modals Trigger Bar */}
        <div className="hidden md:flex items-center space-x-2">
          {/* Cheese Balance & Cat Selection */}
          <button
            onClick={onOpenSkinsModal}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 border border-amber-400 text-amber-950 font-bold text-xs shadow-sm transition transform hover:scale-105"
          >
            <span className="text-base">{currentSkin.icon}</span>
            <span className="text-white drop-shadow-sm font-black">{language === 'th' ? currentSkin.nameTh : currentSkin.nameEn}</span>
            <span className="bg-amber-950/60 text-amber-300 px-2 py-0.5 rounded-lg flex items-center space-x-1 font-mono">
              <span>🧀</span>
              <span>{cheeseCount}</span>
            </span>
          </button>

          {/* Quests */}
          <button
            onClick={onOpenAchievementsModal}
            className="p-2 rounded-xl bg-amber-950/60 hover:bg-amber-800 border border-amber-700 text-amber-200 hover:text-white transition"
            title={language === 'th' ? 'ภารกิจ & รางวัล' : 'Achievements'}
          >
            <Award className="w-4 h-4 text-amber-400" />
          </button>

          {/* Leaderboards */}
          <button
            onClick={onOpenLeaderboardModal}
            className="p-2 rounded-xl bg-amber-950/60 hover:bg-amber-800 border border-amber-700 text-amber-200 hover:text-white transition"
            title={language === 'th' ? 'คะแนนสูงสุด' : 'Leaderboard'}
          >
            <Trophy className="w-4 h-4 text-yellow-400" />
          </button>

          {/* Help / Controls */}
          <button
            onClick={onOpenHelpModal}
            className="p-2 rounded-xl bg-amber-950/60 hover:bg-amber-800 border border-amber-700 text-amber-200 hover:text-white transition"
            title={language === 'th' ? 'วิธีเล่น' : 'How to Play'}
          >
            <Info className="w-4 h-4 text-cyan-300" />
          </button>

          {/* Sound Mute */}
          <button
            onClick={onToggleMute}
            className="p-2 rounded-xl bg-amber-950/60 hover:bg-amber-800 border border-amber-700 text-amber-200 transition"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Language Toggle */}
          <button
            onClick={onToggleLanguage}
            className="px-2.5 py-1.5 text-xs font-bold rounded-xl bg-amber-800 hover:bg-amber-700 border border-amber-600 text-amber-100 transition shadow-sm"
          >
            {language === 'th' ? 'TH 🇹🇭' : 'EN 🇬🇧'}
          </button>
        </div>

      </div>

      {/* Mobile Bar for Cheese & Skin */}
      <div className="flex md:hidden items-center justify-between px-3 py-1.5 bg-amber-950/80 border-t border-amber-800/60 text-xs">
        <button
          onClick={onOpenSkinsModal}
          className="flex items-center space-x-1.5 text-amber-200 font-bold"
        >
          <span className="text-base">{currentSkin.icon}</span>
          <span className="text-amber-100">{language === 'th' ? currentSkin.nameTh : currentSkin.nameEn}</span>
          <Shirt className="w-3.5 h-3.5 text-amber-400 ml-1" />
        </button>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1 bg-amber-900 px-2 py-0.5 rounded-lg border border-amber-700 font-mono font-bold text-amber-300">
            <span>🧀</span>
            <span>{cheeseCount}</span>
          </div>

          <button onClick={onOpenAchievementsModal} className="text-amber-300 font-medium">
            <Award className="w-4 h-4 text-amber-400 inline mr-0.5" />
          </button>
          <button onClick={onOpenLeaderboardModal} className="text-amber-300 font-medium">
            <Trophy className="w-4 h-4 text-yellow-400 inline mr-0.5" />
          </button>
          <button onClick={onOpenHelpModal} className="text-cyan-300 font-medium">
            <Info className="w-4 h-4 inline mr-0.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
