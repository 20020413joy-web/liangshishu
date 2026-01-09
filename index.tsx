import React, { useState, useEffect, useRef, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { 
  createHashRouter, RouterProvider, Navigate, Outlet, 
  NavLink, useLocation, useNavigate, useSearchParams, useBlocker 
} from 'react-router-dom';
import { 
  Home, PenTool, ClipboardList, User, HelpCircle, Trophy, Zap, 
  Menu, X, Play, ChevronDown, BookOpen, Settings2, Settings, 
  Book, List, CheckCircle, ChevronLeft, Star, Award, CheckCircle2, 
  XCircle, Send, Image as ImageIcon, Bot, Paperclip, TrendingUp, 
  Target, ListChecks, Calendar, Users, ArrowRight, ArrowLeft, 
  Loader2, RefreshCcw, AlertTriangle, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, 
  PolarRadiusAxis, Radar, AreaChart, Area 
} from 'recharts';

// --- TYPES ---
enum QuestionType {
  SINGLE_CHOICE = '單選題',
  FILL_IN_BLANK = '填充題'
}

interface Question {
  id: string;
  type: QuestionType;
  content: string;
  options?: string[];
  correctAnswer: string;
  solution: string;
  tags: string[];
  difficulty: number;
}

interface Chapter {
  id: string;
  title: string;
  subChapters?: Chapter[];
  videoId?: string;
}

interface ExamStats {
  topMark: number;
  avgMark: number;
  lowMark: number;
  distribution: number[];
}

interface ExamRecord {
  id: string;
  examId?: string;
  date: string; 
  title: string;
  type: 'Practice' | 'Exam';
  score: number;
  totalScore: number;
  answers: Record<string, string>;
  questions: Question[];
  globalStats?: ExamStats;
}

interface UserStats {
  streak: number;
  points: number;
  lastDailyChallenge?: string; 
}

interface WeeklyExam {
  id: string;
  title: string;
  dateRange: string;
  status: 'upcoming' | 'available' | 'completed' | 'missed';
  questions: Question[];
}

// --- MOCK DATA ---
const CHAPTERS: Chapter[] = [
  {
    id: '1', title: '第一章 數與式',
    subChapters: [
      { id: '1-1', title: '1-1 實數', videoId: 'x8v_pNX6bQY' },
      { id: '1-2', title: '1-2 式的運算', videoId: 'video-1-2' },
      { id: '1-3', title: '1-3 指數與對數', videoId: 'video-1-3' },
    ]
  },
  {
    id: '2', title: '第二章 直線與圓',
    subChapters: [
      { id: '2-1', title: '2-1 直線方程式', videoId: 'video-2-1' },
      { id: '2-2', title: '2-2 圓方程式', videoId: 'video-2-2' },
    ]
  }
];

const QUESTION_POOL: Question[] = [
  {
    id: 'q1', type: QuestionType.SINGLE_CHOICE,
    content: '若 $x$ 為實數且 $|x-2| \\le 3$，則 $x$ 的範圍為何？',
    options: ['$-1 \\le x \\le 5$', '$-5 \\le x \\le 1$', '$1 \\le x \\le 5$', '$x \\ge 5$ 或 $x \\le -1$'],
    correctAnswer: '0', solution: '由 $|x-2| \\le 3$ 可得 $-3 \\le x-2 \\le 3$，兩邊加 2 得 $-1 \\le x \\le 5$。',
    tags: ['1-1'], difficulty: 2
  },
  {
    id: 'q2', type: QuestionType.FILL_IN_BLANK,
    content: '設 $a=\\sqrt{7+\\sqrt{48}}$，則 $a$ 的整數部分為 $\\underline{\\hspace{1cm}}$。',
    correctAnswer: '3', solution: '$a = \\sqrt{7+2\\sqrt{12}} = \\sqrt{4}+\\sqrt{3} = 2 + 1.732... = 3.732...$，故整數部分為 3。',
    tags: ['1-1'], difficulty: 3
  },
  {
    id: 'q3', type: QuestionType.SINGLE_CHOICE,
    content: '已知 $1+\\sqrt{2}i$ 為實係數多項式 $f(x)=0$ 之一根，則 $f(x)$ 必含有下列哪一個因式？',
    options: ['$x^2+2x+3$', '$x^2-2x+3$', '$x^2-2x-3$', '$x^2+2x-3$'],
    correctAnswer: '1', solution: '虛根成對，故 $1-\\sqrt{2}i$ 亦為根。因式為 $(x-(1+\\sqrt{2}i))(x-(1-\\sqrt{2}i)) = (x-1)^2+2 = x^2-2x+3$。',
    tags: ['1-2'], difficulty: 4
  },
  {
    id: 'q4', type: QuestionType.FILL_IN_BLANK,
    content: '求值：$\\log_2 8 + \\log_3 9 = \\underline{\\hspace{1cm}}$。',
    correctAnswer: '5', solution: '$\\log_2 2^3 + \\log_3 3^2 = 3 + 2 = 5$。',
    tags: ['1-3'], difficulty: 1
  }
];

const HISTORY_KEY = 'LSS_HISTORY_RECORDS';
const STATS_KEY = 'LSS_USER_STATS';

const getHistory = (): ExamRecord[] => {
  const stored = localStorage.getItem(HISTORY_KEY);
  return stored ? JSON.parse(stored) : [];
};

const saveRecord = (record: ExamRecord) => {
  const history = getHistory();
  localStorage.setItem(HISTORY_KEY, JSON.stringify([record, ...history]));
};

const getUserStats = (): UserStats => {
  const stored = localStorage.getItem(STATS_KEY);
  return stored ? JSON.parse(stored) : { streak: 12, points: 2450 };
};

const completeDailyChallenge = (isCorrect: boolean): UserStats => {
  const stats = getUserStats();
  const today = new Date().toISOString().split('T')[0];
  if (stats.lastDailyChallenge !== today) {
    if (isCorrect) stats.points += 100;
    stats.streak += 1;
    stats.lastDailyChallenge = today;
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  }
  return stats;
};

// --- COMPONENTS ---
const MathRenderer: React.FC<{ children: string; className?: string; block?: boolean }> = ({ children, className = '', block = false }) => {
  const containerRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = '';
    const parts = children.split(/(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$)/g);
    parts.forEach((part) => {
      if (!part) return;
      if (part.startsWith('$$') && part.endsWith('$$')) {
        const tex = part.slice(2, -2);
        const span = document.createElement('span');
        span.className = 'block my-4 text-center';
        try { (window as any).katex?.render(tex, span, { displayMode: true, throwOnError: false }); } catch (e) { span.textContent = part; }
        containerRef.current?.appendChild(span);
      } else if (part.startsWith('$') && part.endsWith('$')) {
        const tex = part.slice(1, -1);
        const span = document.createElement('span');
        span.className = 'inline-block px-1';
        try { (window as any).katex?.render(tex, span, { displayMode: false, throwOnError: false }); } catch (e) { span.textContent = part; }
        containerRef.current?.appendChild(span);
      } else {
        containerRef.current?.appendChild(document.createTextNode(part));
      }
    });
  }, [children]);
  return <span ref={containerRef} className={`${className} ${block ? 'block text-center' : 'inline'}`} style={{ wordBreak: 'break-word' }} />;
};

const StructuredInput: React.FC<{ correctAnswer: string; value: string; onChange: (v: string) => void; disabled?: boolean }> = ({ correctAnswer, value, onChange, disabled }) => {
  const structure = useMemo(() => {
    if (correctAnswer.includes('\\sqrt')) return { type: 'root' };
    if (correctAnswer.includes('/')) return { type: 'fraction' };
    return { type: 'number' };
  }, [correctAnswer]);

  return (
    <div className="flex justify-center p-4">
      <input 
        type="text" disabled={disabled} value={value} 
        onChange={(e) => onChange(e.target.value)}
        placeholder="請輸入答案"
        className="w-full max-w-xs p-4 border-2 border-gray-100 rounded-xl text-center text-xl font-black focus:border-primary outline-none"
      />
    </div>
  );
};

// --- PAGES ---
const TeachPage = () => {
  const [activeVideo, setActiveVideo] = useState({ id: '1-1', title: '1-1 實數', videoId: 'x8v_pNX6bQY' });
  const [isPlaying, setIsPlaying] = useState(false);
  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between">
        <h1 className="text-xl font-black text-primary">良師塾：高一數學先修 - {activeVideo.title}</h1>
      </div>
      <div className="chalkboard-frame aspect-video relative overflow-hidden shadow-2xl">
        {!isPlaying ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer bg-chalkboard" onClick={() => setIsPlaying(true)}>
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center border-4 border-white/20"><Play size={32} fill="white" /></div>
            <h3 className="mt-4 text-white font-black tracking-widest">點擊開始觀看</h3>
          </div>
        ) : (
          <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${activeVideo.videoId}?autoplay=1`} allowFullScreen frameBorder="0"></iframe>
        )}
      </div>
    </div>
  );
};

const RewardPage = () => {
  const [stats, setStats] = useState(getUserStats());
  const [isFlipped, setIsFlipped] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = () => {
    const isCorrect = userAnswer === "6";
    setStats(completeDailyChallenge(isCorrect));
    setIsSubmitted(true);
  };

  return (
    <div className="flex flex-col items-center py-8">
      <div className="grid grid-cols-3 gap-4 mb-8 w-full max-w-2xl">
        <div className="bg-white p-4 rounded-2xl shadow-sm text-center">
          <Zap className="mx-auto text-orange-500 mb-2" fill="currentColor" />
          <div className="font-black">{stats.streak} 天</div>
          <div className="text-[8px] text-gray-400">連續答題</div>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm text-center">
          <Star className="mx-auto text-yellow-500 mb-2" fill="currentColor" />
          <div className="font-black">{stats.points}</div>
          <div className="text-[8px] text-gray-400">目前點數</div>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm text-center">
          <Award className="mx-auto text-purple-500 mb-2" />
          <div className="font-black">Lv. 5</div>
          <div className="text-[8px] text-gray-400">數學學徒</div>
        </div>
      </div>
      
      <div className="relative w-full max-w-sm h-96 perspective-1000">
        <motion.div 
          className="w-full h-full preserve-3d"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          onClick={() => !isFlipped && setIsFlipped(true)}
        >
          <div className="absolute inset-0 backface-hidden bg-chalkboard border-8 border-secondary rounded-[2rem] flex flex-col items-center justify-center text-white p-8">
             <Trophy size={64} className="text-yellow-400 mb-4" />
             <h2 className="text-2xl font-black">今日挑戰</h2>
             <p className="mt-2 opacity-70">點擊翻牌</p>
          </div>
          <div className="absolute inset-0 backface-hidden bg-white rounded-[2rem] p-8 flex flex-col" style={{ transform: 'rotateY(180deg)' }}>
             <h3 className="text-primary font-black mb-4">絕對值不等式</h3>
             <MathRenderer>$|2x-1| \le 5$，整數解幾個？</MathRenderer>
             <input type="text" value={userAnswer} onChange={e=>setUserAnswer(e.target.value)} className="mt-4 p-4 bg-gray-50 border-2 border-gray-100 rounded-xl" placeholder="輸入數字" />
             <button onClick={handleSubmit} className="mt-4 py-3 bg-primary text-white rounded-xl font-black">提交答案</button>
             {isSubmitted && <div className="mt-4 font-black text-center">{userAnswer === "6" ? "答對了！+100P" : "可惜答錯了"}</div>}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// --- LAYOUT ---
const Layout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navItems = [
    { to: '/', icon: Home, label: '首頁' },
    { to: '/practice', icon: PenTool, label: '自選' },
    { to: '/exam', icon: Trophy, label: '週考' },
    { to: '/history', icon: ClipboardList, label: '紀錄' },
    { to: '/profile', icon: User, label: '我的' },
  ];
  return (
    <div className="min-h-screen flex flex-col">
      <header className="fixed top-0 inset-x-0 bg-white border-b h-20 z-50 px-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-black">良</div>
          <div className="font-black text-primary text-xl tracking-tighter">良師塾</div>
        </div>
        <nav className="hidden md:flex gap-2">
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} className={({isActive})=>`px-4 py-2 rounded-xl flex items-center gap-2 font-black text-sm ${isActive ? 'bg-green-50 text-primary' : 'text-gray-400 hover:bg-gray-50'}`}>
              <item.icon size={16} /><span className="hidden lg:inline">{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="flex gap-2">
           <NavLink to="/reward" className="p-2 text-yellow-500 bg-yellow-50 rounded-xl"><Zap size={20} fill="currentColor" /></NavLink>
           <button onClick={()=>setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 text-gray-400"><Menu /></button>
        </div>
      </header>
      <main className="pt-24 pb-12 flex-grow max-w-6xl mx-auto w-full px-4">
        <Outlet />
      </main>
    </div>
  );
};

// --- APP & ROUTER ---
const App = () => {
  const router = createHashRouter([
    {
      element: <Layout />,
      children: [
        { path: "/", element: <TeachPage /> },
        { path: "/practice", element: <div className="p-10 text-center font-black">自選題庫系統載入中...</div> },
        { path: "/exam", element: <div className="p-10 text-center font-black">週考中心開放中...</div> },
        { path: "/reward", element: <RewardPage /> },
        { path: "/history", element: <div className="p-10 text-center font-black">正在讀取作答紀錄...</div> },
        { path: "/profile", element: <div className="p-10 text-center font-black">會員中心</div> },
        { path: "*", element: <Navigate to="/" /> }
      ]
    }
  ]);
  return <RouterProvider router={router} />;
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);
