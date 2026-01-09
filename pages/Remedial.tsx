import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { QUESTION_POOL } from '../mockData';
import { Question, QuestionType } from '../types';
import MathRenderer from '../components/MathRenderer';
import StructuredInput from '../components/StructuredInput';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Zap, ArrowRight, Home, RefreshCcw, Loader2, PenTool } from 'lucide-react';

const Remedial: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tag = searchParams.get('tag') || '1-1';
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    const filtered = QUESTION_POOL.filter(q => q.tags.includes(tag));
    const shuffled = [...filtered].sort(() => Math.random() - 0.5);
    setQuestions(shuffled);
  }, [tag]);

  const handleSubmit = () => {
    if (!userAnswer.trim()) return;
    
    const correct = questions[currentIdx].correctAnswer.trim() === userAnswer.trim();
    setIsCorrect(correct);
    setIsSubmitted(true);
    setAttempts(prev => prev + 1);
  };

  const handleNext = () => {
    if (isCorrect) {
      navigate('/history');
    } else {
      setCurrentIdx(prev => (prev + 1) % questions.length);
      setUserAnswer('');
      setIsSubmitted(false);
      setIsCorrect(false);
    }
  };

  const getTagName = (tag: string) => {
    const map: Record<string, string> = {
      '1-1': '實數',
      '1-2': '式的運算',
      '1-3': '指數與對數',
      '2-1': '直線方程式',
      '2-2': '圓方程式'
    };
    return map[tag] || tag;
  };

  if (questions.length === 0) {
    return <div className="flex flex-col items-center justify-center h-64"><Loader2 className="animate-spin text-primary" /></div>;
  }

  const q = questions[currentIdx];

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-8">
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Zap size={120} />
        </div>
        <div className="relative z-10">
          <span className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20">Weakness Remedial Mode</span>
          <h1 className="text-3xl font-black mt-3 mb-2">弱點強化：{getTagName(tag)}</h1>
          <p className="text-indigo-100 text-sm font-bold">目前已嘗試 {attempts} 次練習。直到答對為止，我們一起克服它！</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div 
          key={currentIdx}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col"
        >
          <div className="flex items-center gap-4 mb-8">
            <span className="px-3 py-1 bg-gray-100 text-gray-400 rounded-lg font-black text-xs uppercase tracking-widest">知識點：{tag}</span>
            <span className="px-2 py-0.5 bg-secondary/10 text-secondary rounded-lg text-[10px] font-black">{q.type}</span>
          </div>

          <div className="text-xl font-bold text-neutral leading-relaxed mb-10">
            <MathRenderer>{q.content}</MathRenderer>
          </div>

          <div className="flex-grow">
            {q.type === QuestionType.SINGLE_CHOICE ? (
              <div className="grid grid-cols-1 gap-3">
                {q.options?.map((opt, oIdx) => {
                  const isSelected = userAnswer === oIdx.toString();
                  return (
                    <button 
                      key={oIdx} 
                      disabled={isSubmitted}
                      onClick={() => setUserAnswer(oIdx.toString())}
                      className={`p-5 rounded-2xl border-2 text-left transition-all flex items-center gap-4 group ${
                        isSelected ? 'border-primary bg-green-50 text-primary' : 'border-gray-50 text-gray-500 hover:border-gray-100'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-black text-sm transition-colors ${
                        isSelected ? 'border-primary bg-primary text-white' : 'border-gray-200'
                      }`}>
                        {String.fromCharCode(65 + oIdx)}
                      </div>
                      <div className="text-lg font-bold"><MathRenderer>{opt}</MathRenderer></div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="bg-gray-50/50 p-6 rounded-[2rem] border-2 border-dashed border-gray-100">
                <p className="text-xs font-black text-gray-400 mb-4 uppercase tracking-widest flex items-center gap-2">
                  <PenTool size={14} className="text-primary" /> 請填入數位答案
                </p>
                <StructuredInput 
                  correctAnswer={q.correctAnswer}
                  value={userAnswer}
                  disabled={isSubmitted}
                  onChange={(val) => setUserAnswer(val)}
                />
              </div>
            )}
          </div>

          {isSubmitted && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
              className={`mt-8 p-6 rounded-2xl border-2 ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}
            >
              <div className="flex items-center gap-3 mb-4">
                {isCorrect ? <CheckCircle className="text-green-500" /> : <XCircle className="text-red-500" />}
                <p className={`font-black ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                  {isCorrect ? '太棒了！您已經掌握了這個知識點。' : '還差一點點，讓我們看看解析並再試一題。'}
                </p>
              </div>
              <div className="text-sm text-gray-600 bg-white/50 p-4 rounded-xl italic">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">老師解析</p>
                <MathRenderer>{q.solution}</MathRenderer>
              </div>
            </motion.div>
          )}

          <div className="mt-12 flex gap-4">
            {!isSubmitted ? (
              <button 
                onClick={handleSubmit}
                disabled={!userAnswer.trim()}
                className="flex-grow py-5 bg-primary text-white rounded-2xl font-black text-xl shadow-xl shadow-primary/20 hover:shadow-2xl transition disabled:opacity-50"
              >
                檢查答案
              </button>
            ) : (
              <button 
                onClick={handleNext}
                className={`flex-grow py-5 text-white rounded-2xl font-black text-xl shadow-xl transition flex items-center justify-center gap-2 ${isCorrect ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200' : 'bg-neutral hover:bg-gray-800 shadow-gray-200'}`}
              >
                {isCorrect ? (
                  <>完成補救教學 <Home size={20} /></>
                ) : (
                  <>再試一題同型題 <RefreshCcw size={20} /></>
                )}
              </button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Remedial;