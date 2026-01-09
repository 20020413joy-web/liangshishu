import React from 'react';
import { User, Mail, School, CreditCard, ChevronRight, BookOpen, Settings, LogOut } from 'lucide-react';

const Profile: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8">
      {/* Header Info - Clean Mobile Style */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-green-50 rounded-full blur-3xl opacity-50"></div>
        
        <div className="relative">
          <div className="w-24 h-24 bg-gray-100 rounded-3xl flex items-center justify-center border-4 border-white shadow-xl rotate-3 transform">
            <User size={48} className="text-primary opacity-30" />
            {/* Avatar overlay */}
            <div className="absolute inset-0 flex items-center justify-center font-black text-3xl text-primary drop-shadow-sm">王</div>
          </div>
          <div className="absolute -bottom-2 -right-2 bg-secondary text-white p-1.5 rounded-xl shadow-lg">
            <Settings size={14} />
          </div>
        </div>

        <div className="flex-grow text-center md:text-left z-10">
          <h1 className="text-2xl font-black text-neutral mb-1">王大明 <span className="text-xs font-bold text-gray-300 ml-2 italic">Student ID: LS2024001</span></h1>
          <p className="text-gray-400 text-sm font-bold flex items-center justify-center md:justify-start gap-1.5 mb-4">
            <School size={16} className="text-primary" /> 國立建國中學 一年級 A 班
          </p>
          <div className="flex gap-2 justify-center md:justify-start">
            <span className="px-3 py-1.5 bg-green-50 text-primary text-[10px] font-black rounded-xl uppercase tracking-widest border border-green-100">正式付費會員</span>
            <span className="px-3 py-1.5 bg-orange-50 text-secondary text-[10px] font-black rounded-xl uppercase tracking-widest border border-orange-100">點數：2,450 P</span>
          </div>
        </div>
      </div>

      {/* Course Selection Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-black text-neutral flex items-center gap-2 px-1">
          <BookOpen size={20} className="text-primary" />
          我的購買課程 (切換內容)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-3xl shadow-md border-b-4 border-primary relative overflow-hidden group cursor-pointer hover:shadow-lg transition">
            <div className="flex justify-between items-start mb-4">
               <div>
                 <h3 className="text-lg font-black text-neutral">高一數學先修 (上)</h3>
                 <p className="text-[10px] font-bold text-gray-400 mt-0.5 tracking-wider uppercase">Current Active Course</p>
               </div>
               <div className="w-10 h-10 rounded-2xl bg-green-50 flex items-center justify-center shadow-inner">
                 <ChevronRight size={20} className="text-primary" />
               </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-black text-primary uppercase">
                <span>課程進度</span>
                <span>45%</span>
              </div>
              <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden border border-gray-50 shadow-inner">
                <div className="bg-primary h-full w-[45%] shadow-[0_0_10px_rgba(74,103,65,0.3)]"></div>
              </div>
            </div>
            <p className="text-[10px] font-bold text-gray-300 mt-4 text-right">上次觀看：1-2 式的運算</p>
          </div>

          <div className="bg-gray-50 p-6 rounded-3xl border border-gray-200 opacity-60 hover:opacity-100 transition cursor-pointer flex flex-col justify-center border-dashed">
            <div className="text-center">
              <h3 className="text-lg font-black text-gray-400">高一數學先修 (下)</h3>
              <p className="text-[10px] font-bold text-gray-300 mt-2 uppercase tracking-tighter italic">尚未開放 / 預計 2024.03 開課</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Account Settings */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {[
          { icon: Mail, label: '通知與系統設定', color: 'text-blue-400' },
          { icon: CreditCard, label: '訂單記錄與發票', color: 'text-purple-400' },
          { icon: User, label: '帳號與隱私安全', color: 'text-gray-400' },
          { icon: LogOut, label: '登出系統', color: 'text-red-400' },
        ].map((item, idx) => (
          <div 
            key={idx}
            className="p-5 border-b border-gray-50 flex items-center justify-between hover:bg-gray-50 cursor-pointer last:border-0 group transition"
          >
            <div className="flex items-center gap-4">
              <div className={`p-2 rounded-xl transition ${item.color.replace('text', 'bg').replace('400', '50')}`}>
                <item.icon size={18} className={item.color} />
              </div>
              <span className="text-sm font-black text-neutral tracking-tight">{item.label}</span>
            </div>
            <ChevronRight size={16} className="text-gray-300 group-hover:translate-x-1 transition-transform" />
          </div>
        ))}
      </div>
      
      <div className="text-center pb-10">
        <p className="text-[10px] font-black text-gray-200 uppercase tracking-[0.5em]">Liang Shi Shu V1.14.03</p>
      </div>
    </div>
  );
};

export default Profile;