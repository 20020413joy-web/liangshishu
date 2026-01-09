import React, { useState, useEffect, useMemo } from 'react';
import { getHistory } from '../mockData';
import { ExamRecord } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, AreaChart, Area } from 'recharts';
import { ChevronDown, CheckCircle, XCircle, TrendingUp, Target, ListChecks, Calendar, Users, Award, Zap, BookOpen } from 'lucide-react';
import MathRenderer from '../components/MathRenderer';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const History: React.FC = () => {
  const [expandedRecord, setExpandedRecord] = useState<string | null>(null);
  const [historyRecords, setHistoryRecords] = useState<ExamRecord[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    setHistoryRecords(getHistory());
  }, []);

  const radarData = useMemo(() => {
    const categories: Record<string, { correct: number, total: number }> = {
      '1-1 實數': { correct: 0, total: 0 },
      '1-2 式的運算': { correct: 0, total: 0 },
      '1-3 指數對數': { correct: 0, total: 0 },
      '2-1 直線方程式': { correct: 0, total: 0 },
      '2-2 圓方程式': { correct: 0, total: 0 },
    };

    historyRecords.forEach(rec => {
      rec.questions.forEach(q => {
        const tag = q.tags[0];
        let categoryKey = '';
        if (tag === '1-1') categoryKey = '1-1 實數';
        else if (tag === '1-2') categoryKey = '1-2 式的運算';
        else if (tag === '1-3') categoryKey = '1-3 指數對數';
        else if (tag === '2-1') categoryKey = '2-1 直線方程式';
        else if (tag === '2-2') categoryKey = '2-2 圓方程式';

        if (categoryKey && categories[categoryKey]) {
          categories[categoryKey].total++;
          if (rec.answers[q.id]?.trim() === q.correctAnswer) {
            categories[categoryKey].correct++;
          }
        }
      });
    });

    return Object.entries(categories).map(([subject, data]) => ({
      subject,
      A: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
      fullMark: 100
    }));
  }, [historyRecords]);

  const scoreData = useMemo(() => {
    // Updated: Only filter Exam records for the trend chart
    return [...historyRecords]
      .filter(rec => rec.type === 'Exam')
      .reverse()
      .map((rec, idx) => ({
        name: `W${idx + 1}`,
        score: rec.score
      })).slice(-8);
  }, [historyRecords]);

  const handleRemedial = (tag: string) => {
    navigate(`/remedial?tag=${tag}`);
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

  return (
    <div className="pb-12 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-neutral">測驗結果與分析</h1>
          <p className="text-gray-400 text-sm mt-1">掌握您的學習成效與弱點分析</p>
        </div>
        <NavLink to="/exam" className="px-4 py-2 bg-secondary text-white rounded-xl font-bold text-sm shadow-sm flex items-center gap-2">
          <Calendar size={16} /> 週考入口
        </NavLink>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-black text-primary mb-4 flex items-center gap-2">
            <Target size={16} /> 知識點掌握度 (基於歷史作答)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#4a5568', fontSize: 9, fontWeight: 700 }} />
                <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="我的實力" dataKey="A" stroke="#4a6741" fill="#4a6741" fillOpacity={0.6} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
           <h3 className="text-sm font-black text-primary mb-4 flex items-center gap-2">
             <TrendingUp size={16} /> 周考成績趨勢
           </h3>
           <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={scoreData.length > 0 ? scoreData : [{name: '無資料', score: 0}]}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                 <XAxis dataKey="name" tick={{ fill: '#a0aec0', fontSize: 10 }} axisLine={false} tickLine={false} />
                 <YAxis tick={{ fill: '#a0aec0', fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                 <Tooltip cursor={{ fill: '#f7fafc' }} />
                 <Bar dataKey="score" fill="#8b5e3c" radius={[4, 4, 0, 0]} barSize={20} />
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-black text-neutral px-1 flex items-center gap-2">
          <ListChecks size={20} className="text-primary" /> 答題紀錄明細
        </h3>
        {historyRecords.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl text-center text-gray-400 font-bold border-2 border-dashed">
            目前尚無練習紀錄，快去開始一場練習吧！
          </div>
        ) : (
          historyRecords.map((record) => (
            <div key={record.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div 
                className={`p-5 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition ${expandedRecord === record.id ? 'bg-gray-50/50' : ''}`}
                onClick={() => setExpandedRecord(expandedRecord === record.id ? null : record.id)}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black ${record.type === 'Exam' ? 'bg-orange-100 text-secondary border border-orange-200 shadow-inner' : 'bg-green-50 text-primary'}`}>
                    {record.type === 'Exam' ? '週' : '練'}
                  </div>
                  <div>
                    <h4 className="font-bold text-neutral">{record.title}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[9px] font-black text-gray-300 uppercase tracking-tighter">{record.date}</span>
                      {record.type === 'Exam' && <span className="bg-secondary text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase">Official</span>}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className={`text-xl font-black ${record.score >= 60 ? 'text-primary' : 'text-red-500'}`}>
                      {record.score} <span className="text-[10px] text-gray-300 font-bold uppercase">/ {record.totalScore}</span>
                    </div>
                  </div>
                  <div className={`transition-transform duration-300 ${expandedRecord === record.id ? 'rotate-180' : ''}`}>
                    <ChevronDown className="text-gray-300" />
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {expandedRecord === record.id && (
                  <motion.div
                    initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                    className="overflow-hidden border-t border-gray-50 bg-gray-50/30 p-4 md:p-6 space-y-6"
                  >
                    {record.type === 'Exam' && record.globalStats && (
                      <div className="bg-white p-5 rounded-2xl border border-orange-100 shadow-sm space-y-4">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="text-xs font-black text-secondary flex items-center gap-2">
                            <Users size={14} /> 全國排名與分布分析
                          </h5>
                          <span className="text-[10px] font-bold text-gray-400 tracking-tighter italic">Total Students: 1,248</span>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="text-center p-3 bg-gray-50 rounded-xl">
                            <p className="text-[9px] font-black text-gray-400 uppercase">頂標</p>
                            <p className="text-lg font-black text-secondary">{record.globalStats.topMark}</p>
                          </div>
                          <div className="text-center p-3 bg-gray-50 rounded-xl">
                            <p className="text-[9px] font-black text-gray-400 uppercase">均標</p>
                            <p className="text-lg font-black text-primary">{record.globalStats.avgMark}</p>
                          </div>
                          <div className="text-center p-3 bg-gray-50 rounded-xl">
                            <p className="text-[9px] font-black text-gray-400 uppercase">底標</p>
                            <p className="text-lg font-black text-gray-600">{record.globalStats.lowMark}</p>
                          </div>
                        </div>
                        <div className="h-32 mt-4 relative">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={record.globalStats.distribution.map((val, i) => ({ x: i*10, count: val }))}>
                              <defs>
                                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#8b5e3c" stopOpacity={0.1}/>
                                  <stop offset="95%" stopColor="#8b5e3c" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <Area type="monotone" dataKey="count" stroke="#8b5e3c" fillOpacity={1} fill="url(#colorCount)" strokeWidth={2} />
                            </AreaChart>
                          </ResponsiveContainer>
                          <div className="absolute top-0 bottom-0 w-0.5 bg-primary z-20" style={{ left: `${record.score}%` }}>
                            <div className="absolute -top-4 -translate-x-1/2 bg-primary text-white text-[8px] font-black px-1.5 py-0.5 rounded whitespace-nowrap">您在此區</div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-4">
                      {record.questions.map((q, idx) => {
                        const userAnswer = record.answers[q.id];
                        const isCorrect = userAnswer?.trim() === q.correctAnswer;
                        const knowledgeTag = q.tags[0];
                        
                        return (
                          <div key={q.id} className={`bg-white p-5 rounded-2xl border ${isCorrect ? 'border-gray-100' : 'border-red-100 shadow-[0_0_15px_rgba(239,68,68,0.05)]'} relative`}>
                            <div className="flex flex-col gap-4">
                               <div className="flex items-start justify-between">
                                 <div className="flex items-center gap-2">
                                   <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-[10px] ${isCorrect ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                     {idx + 1}
                                   </div>
                                   <div className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md text-[9px] font-black uppercase tracking-wider border border-blue-100">
                                     <BookOpen size={10} />
                                     主要知識點：{knowledgeTag} {getTagName(knowledgeTag)}
                                   </div>
                                 </div>
                                 {isCorrect ? <CheckCircle className="text-green-500" size={20} /> : <XCircle className="text-red-500" size={20} />}
                               </div>

                               <div className="text-sm font-bold text-gray-800 leading-relaxed">
                                 <MathRenderer>{q.content}</MathRenderer>
                               </div>
                               
                               <div className="grid grid-cols-2 gap-3">
                                 <div className={`p-3 rounded-xl border text-[11px] font-bold ${isCorrect ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'}`}>
                                    <span className="opacity-40 mr-1 italic">Your Ans:</span> {q.options ? (userAnswer ? String.fromCharCode(65 + parseInt(userAnswer)) : 'N/A') : (userAnswer || 'N/A')}
                                 </div>
                                 <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-gray-500 text-[11px] font-bold">
                                   <span className="opacity-40 mr-1 italic">Correct:</span> {q.options ? String.fromCharCode(65 + parseInt(q.correctAnswer)) : q.correctAnswer}
                                 </div>
                               </div>

                               {!isCorrect && (
                                 <motion.button
                                   whileHover={{ scale: 1.02 }}
                                   whileTap={{ scale: 0.98 }}
                                   onClick={() => handleRemedial(knowledgeTag)}
                                   className="w-full mt-2 p-3 bg-secondary text-white rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-secondary/20 group overflow-hidden relative"
                                 >
                                   <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                                   <Zap size={14} fill="currentColor" className="animate-pulse" />
                                   強化此弱點知識點：{getTagName(knowledgeTag)}
                                 </motion.button>
                               )}
                               
                               {(isCorrect || expandedRecord === record.id) && (
                                 <div className="mt-2 pt-4 border-t border-dashed border-gray-100">
                                   <div className="text-[9px] font-black text-gray-300 uppercase mb-2 tracking-[0.2em] flex items-center gap-1">
                                     <Award size={10} /> Solution Details
                                   </div>
                                   <div className="text-xs text-gray-600 leading-relaxed bg-gray-50/50 p-3 rounded-xl italic">
                                     <MathRenderer>{q.solution}</MathRenderer>
                                   </div>
                                 </div>
                               )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default History;