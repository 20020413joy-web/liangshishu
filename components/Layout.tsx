import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, PenTool, ClipboardList, User, HelpCircle, Trophy, Zap, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { to: '/', icon: Home, label: '首頁' },
  { to: '/practice', icon: PenTool, label: '自選' },
  { to: '/exam', icon: Trophy, label: '週考' },
  { to: '/history', icon: ClipboardList, label: '紀錄' },
  { to: '/profile', icon: User, label: '我的' },
];

const Logo = () => (
  <div className="flex items-center text-primary group select-none">
    {/* 標誌圖標：三本書造型，頂部對齊，中間較短 */}
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-3">
      <g stroke="currentColor" strokeWidth="2.2" strokeLinecap="butt">
        {/* 左側書籍 - 全長 */}
        <path d="M10 10V38" />
        <path d="M15 10V38" />
        <path d="M9 10H16" strokeWidth="1.5" />
        <path d="M9 38H16" strokeWidth="1.5" />
        
        {/* 中間書籍 - 頂部對齊，長度縮短 */}
        <path d="M22 10V28" />
        <path d="M27 10V28" />
        <path d="M21 10H28" strokeWidth="1.5" />
        <path d="M21 28H28" strokeWidth="1.5" />
        
        {/* 右側書籍 - 全長 */}
        <path d="M34 10V38" />
        <path d="M39 10V38" />
        <path d="M33 10H40" strokeWidth="1.5" />
        <path d="M33 38H40" strokeWidth="1.5" />
      </g>
    </svg>

    <div className="flex flex-col">
      <div className="grid grid-cols-3 w-full text-center gap-x-3">
        <span className="text-2xl font-bold leading-none tracking-tight">良</span>
        <span className="text-2xl font-bold leading-none tracking-tight">師</span>
        <span className="text-2xl font-bold leading-none tracking-tight">塾</span>
      </div>
      <div className="grid grid-cols-3 w-full text-center mt-1.5 gap-x-3">
        <span className="text-[9px] font-black tracking-tighter leading-none opacity-85">LIANG</span>
        <span className="text-[9px] font-black tracking-tighter leading-none opacity-85">SHI</span>
        <span className="text-[9px] font-black tracking-tighter leading-none opacity-85">SHU</span>
      </div>
    </div>
  </div>
);

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <div className="min-h-screen bg-slate-50/30 flex flex-col">
      <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-100 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
          <NavLink to="/" onClick={closeMenu} className="shrink-0">
            <Logo />
          </NavLink>

          <nav className="hidden md:flex items-center gap-1 mx-4">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                    isActive ? 'bg-green-50 text-primary' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                  }`
                }
              >
                <item.icon size={18} />
                <span className="text-sm font-black whitespace-nowrap">{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-1 shrink-0">
            <div className="flex items-center gap-1 mr-2 md:mr-0">
              <NavLink to="/ask" onClick={closeMenu} className={({isActive}) => `p-2 rounded-xl transition ${isActive ? 'bg-primary text-white shadow-md' : 'text-primary hover:bg-green-50'}`}>
                <HelpCircle size={22} />
              </NavLink>
              <NavLink to="/reward" onClick={closeMenu} className={({isActive}) => `p-2 rounded-xl transition ${isActive ? 'bg-yellow-400 text-white shadow-md' : 'text-yellow-500 hover:bg-yellow-50'}`}>
                <Zap size={22} fill="currentColor" />
              </NavLink>
            </div>
            <button onClick={toggleMenu} className="md:hidden p-2 text-gray-400 hover:text-primary hover:bg-gray-50 rounded-xl transition-colors">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="md:hidden bg-white border-t border-gray-100 overflow-hidden">
              <div className="p-4 space-y-2">
                {navItems.map((item) => (
                  <NavLink key={item.to} to={item.to} onClick={closeMenu} className={({ isActive }) => `flex items-center gap-4 p-4 rounded-2xl transition-all ${isActive ? 'bg-primary text-white shadow-md' : 'text-gray-500 bg-gray-50 hover:bg-gray-100'}`}>
                    <item.icon size={20} />
                    <span className="font-black">{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
      
      <main className="flex-grow max-w-6xl mx-auto w-full px-4 pt-24 pb-10">
        <AnimatePresence mode="wait">
          <motion.div key={location.pathname} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="w-full">
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {isMenuOpen && <div className="md:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40 mt-20" onClick={closeMenu} />}
    </div>
  );
};

export default Layout;