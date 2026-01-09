import React, { useState } from 'react';
import { Settings, Book, List, Play, CheckCircle, ChevronLeft } from 'lucide-react';
import { QUESTION_POOL, saveRecord, getFormattedNow } from '../mockData';
import { QuestionType, ExamRecord, Question } from '../types';
import MathRenderer from '../components/MathRenderer';

const Practice: React.FC = () => {
  const [view, setView] = useState<'config' | 'exam'>('config');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [config, setConfig] = useState({ range: 'all', count: 5, source: '綜合' });
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);

  const handleStart = () => {
    let filtered = QUESTION_POOL;
    if (config.range !== 'all') {
      filtered = QUESTION_POOL.filter(q => q.tags.includes(config.range));
    }
    const shuffled = [...filtered].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(config.count, shuffled.length));
    setActiveQuestions(selected);
    setView('exam');
    setAnswers({});
    setIsSubmitted(false);
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    let correct = 0;
    activeQuestions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) correct++;
    });
    const score = Math.round((correct / activeQuestions.length) * 100);

    const record: ExamRecord = {
      id: 'rec_' + Date.now(),
      date: getFormattedNow(),
      title: `${config.range === 'all' ? '全範圍' : config.range} 自選練習`,
      type: 'Practice',
      score: score,
      totalScore: 100,
      answers: answers,
      questions: activeQuestions
    };
    saveRecord(record);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getScore = () => {
    let correct = 0;
    activeQuestions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) correct++;
    });
    return Math.round((correct / activeQuestions.length) * 100);
  };

  if (view === 'exam') {
    return (
      <div className="max-w-3xl mx-auto py-6 space-y-6">
        <button onClick={() => { setView('config'); setIsSubmitted(false); }} className="flex items-center gap-1 text-gray-400 font-bold text-sm hover:text-primary transition">
          <ChevronLeft size={18} /> 返回設定重選範圍
        </button>

        {isSubmitted && (
          <div className="bg-white p-8 rounded-3xl shadow-lg border-b-8 border-primary text-center space-y-3">
             <div className="inline-flex p-3 bg-green-100 text-primary rounded-full mb-2">
               <CheckCircle size={40} />
             </div>
             <h2 className="text-3xl font-black text-neutral">練習結果：{getScore()} 分</h2>
             <p className="text-gray-400 font-bold">已紀錄至答題紀錄，請查看下方詳解訂正。</p>
          </div>
        )}

        <div className="space-y-6 pb-20">
          {activeQuestions.map((q, idx) => (
            <div key={q.id} className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-gray-100">
              <div className="flex items-start gap-4 mb-8">
                <span className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center font-black text-gray-300 text-sm flex-shrink-0">
                  {idx + 1}
                </span>
                <div className="text-xl font-bold text-neutral leading-relaxed">
                  <MathRenderer>{q.content}</MathRenderer>
                </div>
              </div>

              {q.type === QuestionType.SINGLE_CHOICE ? (
                <div className="space-y-3 px-2 md:px-12">
                  {q.options?.map((opt, oIdx) => {
                    const isSelected = answers[q.id] === oIdx.toString();
                    const isCorrect = q.correctAnswer === oIdx.toString();
                    let btnClass = "w-full p-4 rounded-2xl border-2 text-left text-base font-medium transition-all flex items-center gap-5 ";
                    if (isSubmitted) {
                      if (isCorrect) btnClass += "border-green-500 bg-green-50 text-green-700 ";
                      else if (isSelected) btnClass += "border-red-500 bg-red-50 text-red-700 ";
                      else btnClass += "border-gray-50 opacity-40 ";
                    } else {
                      if (isSelected) btnClass += "border-primary bg-green-50 text-primary ";
                      else btnClass += "border-gray-50 hover:border-gray-100 text-gray-600 ";
                    }
                    return (
                      <button key={oIdx} disabled={isSubmitted} onClick={() => setAnswers({...answers, [q.id]: oIdx.toString()})} className={btnClass}>
                        <span className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 text-xs font-bold transition-all ${isSelected ? 'border-primary bg-primary text-white' : 'border-gray-200 text-gray-300'}`}>
                          {String.fromCharCode(65 + oIdx)}
                        </span>
                        <div className="flex-grow">
                          <MathRenderer>{opt}</MathRenderer>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="px-2 md:px-12">
                  <input 
                    type="text"
                    disabled={isSubmitted}
                    placeholder="請輸入答案"
                    value={answers[q.id] || ''}
                    onChange={(e) => setAnswers({...answers, [q.id]: e.target.value})}
                    className={`w-full max-w-sm p-4 rounded-xl border-2 outline-none font-bold text-lg ${
                      isSubmitted 
                        ? (answers[q.id] === q.correctAnswer ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50')
                        : 'border-gray-100 focus:border-primary'
                    }`}
                  />
                  {isSubmitted && (
                    <div className="mt-2 text-xs font-black text-green-600">
                      正確答案：{q.correctAnswer}
                    </div>
                  )}
                </div>
              )}

              {isSubmitted && (
                <div className="mt-8 pt-8 border-t border-dashed border-gray-100">
                  <p className="text-[10px] font-black text-secondary uppercase mb-2 tracking-widest">解題詳情</p>
                  <div className="bg-gray-50 p-6 rounded-2xl text-sm text-gray-600 leading-relaxed italic border border-gray-50">
                    <MathRenderer>{q.solution}</MathRenderer>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {!isSubmitted && (
          <div className="pt-6 pb-24">
            <button 
              onClick={handleSubmit}
              className="w-full py-5 bg-primary text-white rounded-3xl shadow-xl hover:shadow-2xl transition font-black text-xl active:scale-[0.98]"
            >
              提交整份考卷
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-10 space-y-10">
      <div className="text-center">
        <h1 className="text-3xl font-black text-neutral">自選題庫練習</h1>
        <p className="text-gray-400 font-bold mt-2">設定練習範圍，模擬真實考卷作答</p>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-8">
        <div className="space-y-6">
          <div>
            <label className="flex items-center gap-2 text-sm font-black text-neutral mb-3">
              <Book size={18} className="text-primary" /> 選擇範圍
            </label>
            <select
              value={config.range}
              onChange={(e) => setConfig({...config, range: e.target.value})}
              className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/10 transition outline-none font-bold"
            >
              <option value="all">第一章 全範圍</option>
              <option value="1-1">1-1 實數</option>
              <option value="1-3">1-3 指數與對數</option>
              <option value="2-1">2-1 直線方程式</option>
            </select>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-black text-neutral mb-3">
              <List size={18} className="text-secondary" /> 題目數量
            </label>
            <div className="grid grid-cols-4 gap-3">
              {[5, 10, 15, 20].map(n => (
                <button 
                  key={n}
                  onClick={() => setConfig({...config, count: n})}
                  className={`py-3 rounded-xl font-black text-sm transition ${config.count === n ? 'bg-secondary text-white' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                >
                  {n} 題
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-black text-neutral mb-3">
              <Settings size={18} className="text-blue-400" /> 題目來源
            </label>
            <div className="flex flex-wrap gap-2">
              {['建中學資', '歷屆大考', '精選段考', '綜合'].map(s => (
                <button 
                  key={s}
                  onClick={() => setConfig({...config, source: s})}
                  className={`px-4 py-2 rounded-lg font-bold text-[10px] tracking-widest uppercase transition ${config.source === s ? 'bg-blue-500 text-white' : 'bg-blue-50 text-blue-400'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button 
          onClick={handleStart}
          className="w-full py-4 bg-primary text-white rounded-2xl shadow-lg font-black text-lg flex items-center justify-center gap-2 group transition active:scale-95"
        >
          <Play size={20} fill="currentColor" /> 生成考卷並開始
        </button>
      </div>
    </div>
  );
};

export default Practice;