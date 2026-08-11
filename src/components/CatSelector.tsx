import React from 'react';
import { CatSkin, Language } from '../types';
import { CAT_SKINS } from '../utils/storage';
import { soundEngine } from '../utils/sound';
import { X, Check, Lock, Sparkles, Zap, Magnet, Clover } from 'lucide-react';

interface CatSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSkinId: string;
  onSelectSkin: (skinId: string) => void;
  unlockedSkinIds: string[];
  onUnlockSkin: (skinId: string, cost: number) => boolean; // returns true if success
  cheeseCount: number;
  language: Language;
}

export const CatSelector: React.FC<CatSelectorProps> = ({
  isOpen,
  onClose,
  selectedSkinId,
  onSelectSkin,
  unlockedSkinIds,
  onUnlockSkin,
  cheeseCount,
  language,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-amber-950 text-amber-50 border-4 border-amber-700 rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl relative">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-amber-800">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">🐱</span>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-amber-200">
                {language === 'th' ? 'ตู้เสื้อผ้าแมว & ร้านค้า' : 'Cat Wardrobe & Shop'}
              </h2>
              <p className="text-xs text-amber-300">
                {language === 'th' ? 'เลือกน้องแมวตัวโปรด หรือใช้เนยแข็งปลดล็อกตัวใหม่!' : 'Choose your cat or unlock new breeds with Cheese!'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="bg-amber-900 border border-amber-600 px-3 py-1.5 rounded-2xl flex items-center space-x-1.5 font-mono font-bold text-amber-300 text-sm">
              <span>🧀</span>
              <span>{cheeseCount}</span>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-2xl bg-amber-900 hover:bg-amber-800 text-amber-300 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Cats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-5 max-h-[60vh] overflow-y-auto pr-1">
          {CAT_SKINS.map(skin => {
            const isUnlocked = unlockedSkinIds.includes(skin.id);
            const isSelected = selectedSkinId === skin.id;
            const canAfford = cheeseCount >= skin.unlockCost;

            return (
              <div
                key={skin.id}
                className={`p-4 rounded-2xl border-2 transition-all relative flex flex-col justify-between ${
                  isSelected
                    ? 'bg-amber-800/90 border-amber-400 shadow-xl ring-2 ring-amber-400/50'
                    : isUnlocked
                    ? 'bg-amber-900/60 border-amber-700/80 hover:bg-amber-900/90'
                    : 'bg-amber-950/80 border-amber-900 opacity-90'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-3xl border-2 shadow-inner"
                        style={{ backgroundColor: skin.color, borderColor: skin.earColor }}
                      >
                        {skin.icon}
                      </div>
                      <div>
                        <h3 className="font-black text-amber-100 text-base">
                          {language === 'th' ? skin.nameTh : skin.nameEn}
                        </h3>
                        <p className="text-xs text-amber-300/90 leading-tight mt-0.5">
                          {language === 'th' ? skin.descriptionTh : skin.descriptionEn}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Cat Stats */}
                  <div className="grid grid-cols-3 gap-1.5 my-3 pt-2 border-t border-amber-800/60 text-[11px] font-medium text-amber-200">
                    <div className="flex items-center space-x-1 bg-amber-950/60 p-1.5 rounded-lg">
                      <Zap className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{Math.round(skin.speedMultiplier * 100)}% Speed</span>
                    </div>

                    <div className="flex items-center space-x-1 bg-amber-950/60 p-1.5 rounded-lg">
                      <Magnet className="w-3.5 h-3.5 text-purple-400" />
                      <span>{skin.magnetRadius > 0 ? `${skin.magnetRadius}px` : 'None'}</span>
                    </div>

                    <div className="flex items-center space-x-1 bg-amber-950/60 p-1.5 rounded-lg">
                      <Clover className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{Math.round(skin.bonusLuck * 100)}% Luck</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-2">
                  {isUnlocked ? (
                    <button
                      onClick={() => {
                        soundEngine.playClick();
                        onSelectSkin(skin.id);
                      }}
                      disabled={isSelected}
                      className={`w-full py-2 rounded-xl font-black text-xs flex items-center justify-center space-x-1.5 transition ${
                        isSelected
                          ? 'bg-amber-400 text-amber-950 cursor-default shadow'
                          : 'bg-amber-700 hover:bg-amber-600 text-white'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <Check className="w-4 h-4 stroke-[3]" />
                          <span>{language === 'th' ? 'กำลังเลือกใช้งาน' : 'Equipped'}</span>
                        </>
                      ) : (
                        <span>{language === 'th' ? 'เลือกใช้งาน' : 'Select'}</span>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        if (onUnlockSkin(skin.id, skin.unlockCost)) {
                          soundEngine.playPowerUp();
                        }
                      }}
                      disabled={!canAfford}
                      className={`w-full py-2 rounded-xl font-black text-xs flex items-center justify-center space-x-1.5 transition ${
                        canAfford
                          ? 'bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-amber-950 shadow-md'
                          : 'bg-amber-950/80 text-amber-600 border border-amber-900 cursor-not-allowed'
                      }`}
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>
                        {language === 'th' ? 'ปลดล็อก' : 'Unlock'} ({skin.unlockCost} 🧀)
                      </span>
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="text-center pt-2 text-xs text-amber-400 font-medium">
          {language === 'th'
            ? '✨ สะสมเนยแข็งจากการเล่นเกมเพื่อปลดล็อกน้องแมวตัวใหม่ครบทุกตัว!'
            : '✨ Collect cheese during games to unlock all unique cats!'}
        </div>

      </div>
    </div>
  );
};
