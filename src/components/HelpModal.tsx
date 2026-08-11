import React from 'react';
import { Language } from '../types';
import { X, Info, Zap, Sparkles, Clock, ShieldAlert } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose, language }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#FDFCF0] text-[#4A3B2A] border-4 border-[#E9DCC9] rounded-3xl max-w-lg w-full p-5 sm:p-7 shadow-2xl relative">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E9DCC9]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#8B9D77]/20 flex items-center justify-center text-2xl border border-[#8B9D77]/40">
              💡
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#4A3B2A]">
                {language === 'th' ? 'วิธีเล่น & คำแนะนำ' : 'How to Play & Guide'}
              </h2>
              <p className="text-xs text-[#7C6A58]">
                {language === 'th' ? 'เรียนรู้เทคนิคการจับหนูและใช้งานไอเทมพิเศษ' : 'Learn mechanics and item powers'}
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

        {/* Content */}
        <div className="space-y-4 my-4 max-h-[60vh] overflow-y-auto pr-1 text-xs sm:text-sm">
          
          {/* Controls Section */}
          <div className="bg-[#F4EFE6] p-3.5 rounded-2xl border border-[#E5DAC8]">
            <h3 className="font-bold text-[#4A3B2A] text-sm mb-2 flex items-center space-x-1.5">
              <span>🎮</span>
              <span>{language === 'th' ? 'การควบคุมแมว' : 'Cat Controls'}</span>
            </h3>
            <ul className="space-y-1.5 text-[#7C6A58] text-xs leading-relaxed">
              <li>• <strong>{language === 'th' ? 'เมาส์ / สัมผัส' : 'Mouse / Touch'}:</strong> {language === 'th' ? 'แมวจะวิ่งตามตำแหน่งนิ้วหรือเคอร์เซอร์เมาส์ของคุณ' : 'Cat follows mouse cursor or finger touch directly.'}</li>
              <li>• <strong>{language === 'th' ? 'คีย์บอร์ด' : 'Keyboard'}:</strong> {language === 'th' ? 'กด W A S D หรือ ปุ่มลูกศร เพื่อเลี้ยว' : 'Use WASD or Arrow Keys to move.'}</li>
              <li>• <strong>DASH (แดชพุ่งตัว):</strong> {language === 'th' ? 'กดปุ่ม Spacebar หรือ ปุ่ม DASH บนหน้าจอเพื่อพุ่งตัวไปข้างหน้า!' : 'Press Spacebar or Dash Button for instant speed thrust!'}</li>
            </ul>
          </div>

          {/* Mouse Types */}
          <div className="bg-[#F4EFE6] p-3.5 rounded-2xl border border-[#E5DAC8]">
            <h3 className="font-bold text-[#4A3B2A] text-sm mb-2 flex items-center space-x-1.5">
              <span>🐭</span>
              <span>{language === 'th' ? 'ประเภทของหนู' : 'Mouse Types'}</span>
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-[#EFE8DA] p-2 rounded-xl">
                <span className="font-bold text-[#4A3B2A]">🐭 หนูธรรมดา</span>
                <p className="text-[11px] text-[#7C6A58] mt-0.5">+100 คะแนน | +1 🧀</p>
              </div>
              <div className="bg-[#EFE8DA] p-2 rounded-xl">
                <span className="font-bold text-[#B8860B]">🐭 หนูทองคำ</span>
                <p className="text-[11px] text-[#7C6A58] mt-0.5">+300 คะแนน | +3 🧀</p>
              </div>
              <div className="bg-[#EFE8DA] p-2 rounded-xl">
                <span className="font-bold text-[#5C6F48]">🐭 หนูชีสยักษ์</span>
                <p className="text-[11px] text-[#7C6A58] mt-0.5">+500 คะแนน | +5 🧀 (ชน 2 ครั้ง)</p>
              </div>
              <div className="bg-[#EFE8DA] p-2 rounded-xl">
                <span className="font-bold text-[#C85A48]">💣 หนูกลกลอน</span>
                <p className="text-[11px] text-[#7C6A58] mt-0.5">ระวัง! ชนแล้วเสียคะแนนและมึนหัว!</p>
              </div>
            </div>
          </div>

          {/* Power-ups */}
          <div className="bg-[#F4EFE6] p-3.5 rounded-2xl border border-[#E5DAC8]">
            <h3 className="font-bold text-[#4A3B2A] text-sm mb-2 flex items-center space-x-1.5">
              <span>✨</span>
              <span>{language === 'th' ? 'ไอเทมเสริมพลัง' : 'Power-Up Items'}</span>
            </h3>
            <ul className="space-y-1.5 text-xs text-[#7C6A58]">
              <li>🌿 <strong>Catnip (แคทนิป):</strong> {language === 'th' ? 'เพิ่มความเร็วสายฟ้า + คะแนนคูณ 2!' : 'Frenzied speed boost + Double points!'}</li>
              <li>🧀 <strong>Golden Cheese (เนยทอง):</strong> {language === 'th' ? 'ได้รับเนยแข็งทันที +5 ก้อน' : 'Instant +5 Cheese bonus!'}</li>
              <li>⏱️ <strong>Clock Freeze (แช่แข็ง):</strong> {language === 'th' ? 'หยุดหนูทั้งฉากให้นิ่งอยู่กับที่ 4 วินาที' : 'Freezes all mice in place for 4 seconds!'}</li>
              <li>🐟 <strong>Fish Snack (ขนมแมว):</strong> {language === 'th' ? 'เพิ่มพลังชีวิต +1 หัวใจ' : 'Adds +1 Extra Heart life!'}</li>
            </ul>
          </div>

        </div>

      </div>
    </div>
  );
};
