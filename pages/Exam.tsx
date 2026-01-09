import React, { useState, useEffect, useRef } from 'react';
import { WEEKLY_EXAMS, QUESTION_POOL, saveRecord, getFormattedNow, generateGlobalStats, getHistory } from '../mockData';
import { WeeklyExam, ExamRecord, Question } from '../types';
import { Calendar, AlertCircle, Clock, CheckCircle, ArrowRight, ArrowLeft, Loader2, Trophy, BookOpen, PenTool, XCircle, AlertTriangle } from 'lucide-react';
import { useNavigate, useBlocker } from 'react-router-dom';
import MathRenderer from '../components/MathRenderer';
import StructuredInput from '../components/StructuredInput';
import { QuestionType } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

const Exam: React.FC = () => {
  const [activeExam, setActiveExam] = useState<WeeklyExam | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(45 * 60);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [history, setHistory] = useState<ExamRecord[]>([]);
  const navigate = useNavigate();
  const timerRef = useRef<number | null>(null);

  // Blocker for navigation guard - must be used within a Data Router
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      activeExam !== null && 
      !isSubmitting && 
      currentLocation.pathname !== nextLocation.pathname
  );

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  useEffect(() => {
    if (activeExam && timeLeft > 0 && !isSubmitting) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (activeExam && timeLeft === 0 && !isSubmitting) {
      handleAutoSubmit();
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeExam, timeLeft, isSubmitting]);

  const startExam = (exam: WeeklyExam) => {
    const attempts = history.filter(h => h.examId === exam.id).length;
    if (attempts >= 2) {
      alert("此測驗作答次數已達上限 (2/2)");
      return;
    }
    setActiveExam(exam);
    setTimeLeft(45 * 60);
    setAnswers({});
    setCurrentIdx(0);
    setIsSubmitting(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAutoSubmit = () => {
    const questions = activeExam?.questions || QUESTION_POOL.slice(0, 10);
    submitFinal(questions, true);
  };

  const submitFinal = async (questions: Question[], isAuto = false) => {
    if (isSubmitting || !activeExam) return;

    setIsSubmitting(true);
    if (timerRef.current) clearInterval(timerRef.current);

    try {
      let correct = 0;
      questions.forEach(q => {
        const userAnswer = (answers[q.id] || '').trim();
        const correctAnswer = (q.correctAnswer || '').trim();
        if (userAnswer === correctAnswer) {
          correct++;
        }
      });
      const score = Math.round((correct / questions.length) * 100);

      const record: ExamRecord = {
        id: 'exam_' + Date.now(),
        examId: activeExam.id,
        date: getFormattedNow(),
        title: activeExam.title,
        type: 'Exam',
        score: score,
        totalScore: 100,
        answers: { ...answers },
        questions: [...questions],
        globalStats: generateGlobalStats()
      };
      
      saveRecord(record);
      
      // If blocked navigation triggered this, we proceed after saving
      if (blocker.state === 'blocked') {
        blocker.proceed();
      } else {
        setTimeout(() => {
          navigate('/history');
        }, 1500);
      }

    } catch (error) {
      console.error("Critical submission error:", error);
      setIsSubmitting(false);
      alert("提交過程中發生錯誤，請重試。");
    }
  };

  const handleBlockerConfirm = () => {
    const questions = activeExam?.questions || [];
    submitFinal(questions, true);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const getAttemptCount = (examId: string) => {
    return history.filter(h => h.examId === examId).length;
  };

  if (activeExam) {
    const questions = activeExam.questions.slice(0, 10);
    const q = questions[currentIdx];

    return (
      <div className="max-w-4xl mx-auto py-4 space-y-6 pb-32">
        {/* Navigation Warning Modal */}
        <AnimatePresence>
          {blocker.state === 'blocked' && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => blocker.reset()}
              />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                className="relative bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl text-center border-t-8 border-red-500"
              >
                <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertTriangle size={40} className="animate-bounce" />
                </div>
                <h3 className="text-2xl font-black text-neutral mb-3">確定要離開嗎？</h3>
                <p className="text-gray-500 font-bold mb-8 leading-relaxed">
                  警告：離開此頁面將視為<span className="text-red-500">「強制繳交」</span>。您的作答進度將被結算並扣除一次作答次數。
                </p>
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={handleBlockerConfirm}
                    className="w-full py-4 bg-red-500 text-white rounded-2xl font-black shadow-lg hover:bg-red-600 transition"
                  >
                    確定離開並強制繳交
                  </button>
                  <button 
                    onClick={() => blocker.reset()}
                    className="w-full py-4 bg-gray-100 text-gray-500 rounded-2xl font-black hover:bg-gray-200 transition"
                  >
                    返回測驗繼續作答
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isSubmitting && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 bg-primary/95 backdrop-blur-xl z-[100] flex flex-col items-center justify-center text-white"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="mb-8 p-6 bg-white/10 rounded-full border border-white/20"
              >
                <Trophy size={64} className="text-yellow-400" />
              </motion.div>
              <h2 className="text-3xl font-black mb-2 tracking-widest">正在結算測驗成績...</h2>
              <p className="text-white/60 font-bold mb-8">正在保存您的作答數據並分析中</p>
              <div className="w-64 h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1.5 }}
                  className="h-full bg-white shadow-[0_0_20px_white]"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="sticky top-20 z-40 bg-white/95 backdrop-blur-md shadow-lg p-4 rounded-2xl border border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className={`p-2 rounded-lg transition-colors ${timeLeft < 300 ? 'bg-red-500 text-white animate-pulse' : 'bg-red-100 text-red-600'}`}>
               <Clock size={20} />
             </div>
             <div>
               <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Time Remaining</p>
               <p className={`text-xl font-black font-mono leading-none ${timeLeft < 300 ? 'text-red-600' : 'text-neutral'}`}>
                 {formatTime(timeLeft)}
               </p>
             </div>
          </div>
          
          <div className="hidden md:flex gap-1">
            {questions.map((_, i) => (
              <button 
                key={i} 
                disabled={isSubmitting}
                onClick={() => setCurrentIdx(i)}
                className={`w-7 h-7 rounded-lg text-[10px] font-black transition-all border ${
                  currentIdx === i ? 'bg-primary text-white border-primary shadow-md scale-110' : 
                  answers[questions[i].id] ? 'bg-green-50 text-primary border-green-200' : 'bg-gray-50 text-gray-300 border-gray-100'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button 
            onClick={() => submitFinal(questions)}
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-secondary text-white rounded-xl font-black text-sm shadow-md hover:bg-secondary/90 transition active:scale-95 disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : null}
            {isSubmitting ? '處理中' : '繳交試卷'}
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div 
            key={currentIdx}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-gray-100 min-h-[400px] flex flex-col"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <span className="px-3 py-1 bg-gray-100 text-gray-400 rounded-lg font-black text-xs uppercase tracking-widest">第 {currentIdx + 1} 題 / 共 10 題</span>
                <div className="flex items-center gap-2 px-2 py-0.5 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black border border-blue-100">
                  <BookOpen size={10} /> 知識點：{q.tags[0]}
                </div>
              </div>
              <div className="px-3 py-1 bg-red-50 text-red-500 rounded-lg text-[10px] font-black border border-red-100">
                嚴禁離開頁面
              </div>
            </div>

            <div className="text-2xl font-bold text-neutral leading-relaxed mb-10">
              <MathRenderer>{q.content}</MathRenderer>
            </div>

            <div className="flex-grow">
              {q.type === QuestionType.SINGLE_CHOICE ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {q.options?.map((opt, oIdx) => {
                    const isSelected = answers[q.id] === oIdx.toString();
                    return (
                      <button 
                        key={oIdx} 
                        disabled={isSubmitting}
                        onClick={() => setAnswers({...answers, [q.id]: oIdx.toString()})}
                        className={`p-5 rounded-2xl border-2 text-left transition-all flex items-center gap-4 group ${
                          isSelected ? 'border-primary bg-green-50 text-primary shadow-sm' : 'border-gray-50 text-gray-500 hover:border-gray-100 hover:bg-gray-50'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-black text-sm transition-colors ${
                          isSelected ? 'border-primary bg-primary text-white' : 'border-gray-200 group-hover:border-gray-300'
                        }`}>
                          {String.fromCharCode(65 + oIdx)}
                        </div>
                        <div className="text-lg font-bold"><MathRenderer>{opt}</MathRenderer></div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-gray-50/50 p-8 rounded-[2rem] border-2 border-dashed border-gray-100">
                  <p className="text-xs font-black text-gray-400 mb-4 uppercase tracking-widest flex items-center gap-2">
                    <PenTool size={14} className="text-primary" /> 請依照格式填入數位答案
                  </p>
                  <StructuredInput 
                    correctAnswer={q.correctAnswer}
                    value={answers[q.id] || ''}
                    disabled={isSubmitting}
                    onChange={(val) => setAnswers({...answers, [q.id]: val})}
                  />
                </div>
              )}
            </div>

            <div className="mt-12 pt-8 border-t border-gray-50 flex items-center justify-between">
              <button 
                disabled={currentIdx === 0 || isSubmitting}
                onClick={() => setCurrentIdx(prev => prev - 1)}
                className="flex items-center gap-2 px-6 py-3 font-black text-gray-400 hover:text-neutral disabled:opacity-0 transition"
              >
                <ArrowLeft size={18} /> 上一題
              </button>
              
              {currentIdx === 9 ? (
                <button 
                  onClick={() => submitFinal(questions)}
                  disabled={isSubmitting}
                  className="px-10 py-4 bg-primary text-white rounded-2xl font-black text-lg shadow-xl shadow-primary/20 hover:shadow-2xl transition active:scale-95 flex items-center gap-2"
                >
                  {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : null}
                  完成作答並繳卷
                </button>
              ) : (
                <button 
                  disabled={isSubmitting}
                  onClick={() => setCurrentIdx(prev => prev + 1)}
                  className="flex items-center gap-2 px-8 py-3 bg-neutral text-white rounded-2xl font-black hover:bg-gray-800 transition shadow-lg"
                >
                  下一題 <ArrowRight size={18} />
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-10 space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-100 pb-8">
        <div>
          <h1 className="text-4xl font-black text-neutral uppercase tracking-tighter">週考中心</h1>
          <p className="text-gray-400 font-bold mt-2">Liang Shi Shu Weekly Assessment</p>
        </div>
        <div className="flex items-center gap-2 bg-green-50 text-primary px-4 py-2 rounded-full font-black text-xs">
          <Clock size={16} /> 即時開放中
        </div>
      </div>

      <div className="grid gap-6">
        {WEEKLY_EXAMS.map((exam) => {
          const attempts = getAttemptCount(exam.id);
          const isFull = attempts >= 2;
          
          return (
            <div 
              key={exam.id} 
              onClick={() => !isFull && !isSubmitting && startExam(exam)}
              className={`group bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6 transition-all relative overflow-hidden ${
                !isFull ? 'cursor-pointer hover:shadow-xl hover:border-primary/20 hover:-translate-y-1' : 'opacity-70'
              }`}
            >
              <div className="flex items-center gap-6">
                <div className={`w-20 h-20 rounded-3xl flex flex-col items-center justify-center font-black transition-transform group-hover:scale-110 ${
                  !isFull ? 'bg-orange-100 text-secondary border border-orange-200' : 'bg-gray-100 text-gray-400 border border-gray-200'
                }`}>
                  <Calendar size={24} className="mb-1" />
                  <span className="text-[10px]">WEEK</span>
                </div>
                <div className="text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                      !isFull ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {!isFull ? '開放測驗中' : '次數已達上限'}
                    </span>
                    <span className="text-xs text-gray-300 font-bold">{exam.dateRange}</span>
                  </div>
                  <h3 className={`text-2xl font-black transition-colors ${!isFull ? 'text-neutral group-hover:text-primary' : 'text-gray-400'}`}>
                    {exam.title}
                  </h3>
                  <p className="text-xs text-gray-400 font-bold mt-1">作答次數剩餘：<span className={isFull ? 'text-red-500' : 'text-primary'}>{2 - attempts}</span> / 2</p>
                </div>
              </div>

              <div className="w-full md:w-auto">
                {!isFull ? (
                  <button className="w-full px-12 py-4 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/20 group-hover:bg-primary/90 transition flex items-center justify-center gap-2">
                    進入考場 <ArrowRight size={18} />
                  </button>
                ) : (
                  <button disabled className="w-full px-12 py-4 bg-gray-100 text-gray-400 rounded-2xl font-black border border-gray-200 cursor-not-allowed">
                    次數已上限
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-10 bg-gray-50 rounded-[3rem] border border-dashed border-gray-200 text-center">
        <AlertCircle className="mx-auto text-gray-300 mb-4" size={32} />
        <p className="text-sm font-bold text-gray-400 leading-relaxed">
          注意：週考具有時間限制且<span className="text-red-500">僅限作答 2 次</span>。<br/>測驗途中嚴禁離開頁面，否則將自動視為強制繳卷。
        </p>
      </div>
    </div>
  );
};

export default Exam;