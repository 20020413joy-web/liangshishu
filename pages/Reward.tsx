
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Star, Award, CheckCircle2, XCircle, Trophy } from 'lucide-react';
import MathRenderer from '../components/MathRenderer';
// Fixed: UserStats is an interface and should be imported from types.ts
import { getUserStats, completeDailyChallenge } from '../mockData';
import { UserStats } from '../types';

const Reward: React.FC = () => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [stats, setStats] = useState<UserStats>(getUserStats());
  const [isAlreadyDone, setIsAlreadyDone] = useState(false);

  const dailyQuestion = {
    title: "今日挑戰：絕對值不等式",
    content: "若 $|2x-1| \\le 5$，則 $x$ 的整數解共有幾個？",
    solution: "由 $|2x-1| \\le 5$ 得 $-5 \\le 2x-1 \\le 5$，即 $-4 \\le 2x \\le 6$，故 $-2 \\le x \\le 3$。整數解為 $-2, -1, 0, 1, 2, 3$，共 6 個。",
    answer: "6"
  };

  useEffect(() => {
    const currentStats = getUserStats();
    const today = new Date().toISOString().split('T')[0];
    if (currentStats.lastDailyChallenge === today) {
      setIsAlreadyDone(true);
      setIsSubmitted(true);
      setIsFlipped(true);
    }
  }, []);

  const handleSubmit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!userAnswer.trim()) {
      alert("請輸入答案後再提交！");
      return;
    }
    const isCorrect = userAnswer.trim() === dailyQuestion.answer;
    const newStats = completeDailyChallenge(isCorrect);
    setStats(newStats);
    setIsSubmitted(true);
  };

  const isCorrectResult = userAnswer.trim() === dailyQuestion.answer;

  return (
    <div className="flex flex-col items-center py-8 pb-24">
      {/* Dashboard Stats */}
      <div className="w-full max-w-4xl grid grid-cols-3 gap-4 mb-12 px-2">
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center">
          <div className="p-3 bg-orange-100 rounded-2xl mb-2">
            <Zap className="text-orange-500" size={24} fill="currentColor" />
          </div>
          <div className="text-2xl font-black text-neutral">{stats.streak} 天</div>
          <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest">連續答題</div>
        </div>
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-8 h-8 bg-yellow-400/10 rounded-bl-full"></div>
          <div className="p-3 bg-yellow-100 rounded-2xl mb-2">
            <Star className="text-yellow-500" size={24} fill="currentColor" />
          </div>
          <div className="text-2xl font-black text-neutral">{stats.points.toLocaleString()}</div>
          <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest">目前點數</div>
        </div>
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center">
          <div className="p-3 bg-purple-100 rounded-2xl mb-2">
            <Award className="text-purple-500" size={24} />
          </div>
          <div className="text-2xl font-black text-neutral">Lv. 5</div>
          <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest">數學學徒</div>
        </div>
      </div>

      {/* Flip Card Container */}
      <div className="relative w-full max-w-sm h-[500px] perspective-1000">
        <motion.div
          className="w-full h-full relative preserve-3d cursor-pointer"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.8, type: "spring", stiffness: 100, damping: 20 }}
          style={{ transformStyle: 'preserve-3d' }}
          onClick={() => !isFlipped && setIsFlipped(true)}
        >
          {/* Front: Hidden State */}
          <div 
            className="absolute inset-0 backface-hidden bg-gradient-to-br from-chalkboard to-[#3e5636] rounded-[2.5rem] shadow-2xl flex flex-col items-center justify-center text-white p-10 border-8 border-[#8b5e3c]"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mb-8 backdrop-blur-md border border-white/20"
            >
              <Trophy size={48} className="text-yellow-400" />
            </motion.div>
            <h2 className="text-3xl font-black mb-3 tracking-[0.2em]">今日挑戰</h2>
            <p className="text-green-100/70 text-center text-sm font-bold mb-8">翻牌作答並正確<br/>即可領取 100 點獎勵！</p>
            <div className="px-8 py-3 bg-white text-primary rounded-2xl font-black shadow-lg hover:scale-105 transition active:scale-95">
              點擊翻開題目
            </div>
            <div className="absolute bottom-6 text-[10px] font-bold text-white/30 uppercase tracking-[0.5em]">Daily Challenge</div>
          </div>

          {/* Back: Question & Answer State */}
          <div 
            className="absolute inset-0 backface-hidden bg-white rounded-[2.5rem] shadow-2xl p-8 flex flex-col border border-gray-100"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
            onClick={(e) => e.stopPropagation()}
          >
             <div className="flex-grow flex flex-col">
               <div className="flex items-center justify-between mb-6">
                 <h3 className="text-xs font-black text-secondary tracking-widest uppercase">{dailyQuestion.title}</h3>
                 {isAlreadyDone && <span className="text-[10px] font-black text-green-500 bg-green-50 px-2 py-1 rounded-full border border-green-100">今日已完成</span>}
               </div>

               <div className="text-xl font-bold text-neutral mb-8 leading-relaxed">
                 <MathRenderer>{dailyQuestion.content}</MathRenderer>
               </div>
               
               <AnimatePresence mode="wait">
                 {!isSubmitted ? (
                   <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                    className="space-y-4"
                   >
                     <div className="relative">
                       <input 
                         type="text"
                         value={userAnswer}
                         onChange={(e) => setUserAnswer(e.target.value)}
                         placeholder="請輸入答案..."
                         className="w-full p-5 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 font-black text-xl transition-all"
                       />
                       <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-300">ANS</div>
                     </div>
                     <button 
                       onClick={handleSubmit}
                       className="w-full py-4 bg-primary text-white rounded-2xl font-black text-lg shadow-xl shadow-primary/20 hover:bg-primary/90 transition active:scale-95"
                     >
                       提交答案領取積分
                     </button>
                   </motion.div>
                 ) : (
                   <motion.div 
                     initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                     className="flex-grow flex flex-col"
                   >
                     <div className={`p-6 rounded-3xl border-2 mb-6 flex items-center gap-4 ${isCorrectResult ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                       {isCorrectResult ? (
                         <>
                           <CheckCircle2 className="text-green-500 flex-shrink-0" size={32} />
                           <div>
                             <p className="font-black text-green-700">答對了！</p>
                             <p className="text-xs font-bold text-green-600/70">獲得點數 +100 / 連續答題 +1</p>
                           </div>
                         </>
                       ) : (
                         <>
                           <XCircle className="text-red-500 flex-shrink-0" size={32} />
                           <div>
                             <p className="font-black text-red-700">答錯了...</p>
                             <p className="text-xs font-bold text-red-600/70">獲得點數 +0 / 連續答題 +1</p>
                           </div>
                         </>
                       )}
                     </div>

                     <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 flex-grow overflow-y-auto">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">正確解析與思路</p>
                        <div className="text-sm font-bold text-gray-700 mb-2">正確答案：{dailyQuestion.answer}</div>
                        <div className="text-xs text-gray-500 leading-relaxed italic border-t border-gray-200 pt-3">
                          <MathRenderer>{dailyQuestion.solution}</MathRenderer>
                        </div>
                     </div>
                   </motion.div>
                 )}
               </AnimatePresence>
             </div>
          </div>
        </motion.div>
      </div>

      <p className="mt-12 text-gray-400 text-[10px] font-black uppercase tracking-[0.3em] text-center max-w-xs px-6">
        Every day is a new chance to learn.<br/>Keep your streak and earn more rewards.
      </p>
    </div>
  );
};

export default Reward;
