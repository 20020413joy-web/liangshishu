import React, { useState } from 'react';
import { Question, QuestionType } from '../types';
import MathRenderer from './MathRenderer';
import { CheckCircle, XCircle, ArrowRight, Flag } from 'lucide-react';

interface QuizInterfaceProps {
  questions: Question[];
  onSubmit: (answers: Record<string, string>) => void;
  mode: 'practice' | 'exam';
}

const QuizInterface: React.FC<QuizInterfaceProps> = ({ questions, onSubmit, mode }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);

  const currentQ = questions[currentIdx];

  const handleSelectOption = (idx: number) => {
    if (showResults) return;
    setAnswers(prev => ({ ...prev, [currentQ.id]: idx.toString() }));
  };

  const handleFillBlank = (val: string) => {
    if (showResults) return;
    setAnswers(prev => ({ ...prev, [currentQ.id]: val }));
  };

  const handleSubmit = () => {
    if (mode === 'practice') {
      setShowResults(true);
      onSubmit(answers); // Just log or save
    } else {
      onSubmit(answers); // Parent handles navigation/saving
    }
  };

  // Calculate score for immediate feedback in practice mode
  const getScore = () => {
    let correct = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) correct++;
    });
    return Math.round((correct / questions.length) * 100);
  };

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto">
      {/* Progress Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="text-sm font-bold text-gray-500">
          題號 {currentIdx + 1} / {questions.length}
        </div>
        <div className="flex gap-2">
          {questions.map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full ${
                i === currentIdx ? 'bg-primary' : answers[questions[i].id] ? 'bg-green-200' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Result Overview (Only for Practice after submit) */}
      {showResults && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6 text-center">
          <h3 className="text-2xl font-bold text-neutral mb-2">練習完成!</h3>
          <div className="text-4xl font-black text-primary mb-4">{getScore()} 分</div>
          <p className="text-gray-500 mb-4">請查看下方詳解訂正</p>
        </div>
      )}

      {/* Question Card */}
      <div className="bg-white p-6 md:p-10 rounded-xl shadow-lg border-t-4 border-primary relative flex-grow overflow-y-auto">
        <div className="mb-6">
          <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded mb-3 font-bold">
            {currentQ.type}
          </span>
          <div className="text-lg md:text-xl font-medium text-neutral leading-relaxed">
            <MathRenderer>{currentQ.content}</MathRenderer>
          </div>
        </div>

        {/* Options / Input */}
        <div className="space-y-3">
          {currentQ.type === QuestionType.SINGLE_CHOICE && currentQ.options?.map((opt, idx) => {
            const isSelected = answers[currentQ.id] === idx.toString();
            const isCorrect = currentQ.correctAnswer === idx.toString();
            
            let cardClass = "w-full p-4 rounded-lg border-2 text-left transition flex items-center gap-3 ";
            if (showResults) {
              if (isCorrect) cardClass += "border-green-500 bg-green-50 ";
              else if (isSelected && !isCorrect) cardClass += "border-red-500 bg-red-50 ";
              else cardClass += "border-gray-100 opacity-50 ";
            } else {
              if (isSelected) cardClass += "border-primary bg-green-50 text-primary ";
              else cardClass += "border-gray-100 hover:border-gray-200 hover:bg-gray-50 text-gray-600 ";
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelectOption(idx)}
                className={cardClass}
                disabled={showResults}
              >
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold ${
                  isSelected ? 'border-primary text-primary' : 'border-gray-300 text-gray-400'
                }`}>
                  {String.fromCharCode(65 + idx)}
                </div>
                <div className="flex-grow">
                   <MathRenderer>{opt}</MathRenderer>
                </div>
                {showResults && isCorrect && <CheckCircle className="text-green-500" size={20} />}
                {showResults && isSelected && !isCorrect && <XCircle className="text-red-500" size={20} />}
              </button>
            );
          })}

          {currentQ.type === QuestionType.FILL_IN_BLANK && (
            <div className="mt-4">
              <input
                type="text"
                value={answers[currentQ.id] || ''}
                onChange={(e) => handleFillBlank(e.target.value)}
                disabled={showResults}
                placeholder="請輸入答案"
                className={`w-full p-4 border-2 rounded-lg outline-none text-lg ${
                   showResults
                     ? answers[currentQ.id] === currentQ.correctAnswer 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-red-500 bg-red-50'
                     : 'border-gray-200 focus:border-primary'
                }`}
              />
              {showResults && (
                <div className="mt-2 text-green-600 font-bold">
                  正確答案：{currentQ.correctAnswer}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Explanation (Only in practice mode after submit) */}
        {showResults && (
           <div className="mt-8 pt-6 border-t border-gray-100">
             <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
               <Flag size={16} className="text-secondary" />
               解析
             </h4>
             <div className="bg-gray-50 p-4 rounded text-gray-700 text-sm leading-relaxed">
               <MathRenderer>{currentQ.solution}</MathRenderer>
             </div>
           </div>
        )}
      </div>

      {/* Controls */}
      <div className="mt-6 flex justify-between items-center">
        <button
          onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))}
          disabled={currentIdx === 0}
          className="px-4 py-2 text-gray-500 font-medium disabled:opacity-30 hover:bg-gray-100 rounded"
        >
          上一題
        </button>

        {currentIdx === questions.length - 1 ? (
          !showResults ? (
            <button
              onClick={handleSubmit}
              className="px-8 py-3 bg-neutral text-white rounded-lg shadow-lg hover:bg-gray-800 transition font-bold"
            >
              {mode === 'exam' ? '繳交試卷' : '提交答案'}
            </button>
          ) : (
            <button
              onClick={() => {}} // Could navigate back
              className="px-8 py-3 bg-gray-200 text-gray-600 rounded-lg cursor-not-allowed font-bold"
            >
              已完成
            </button>
          )
        ) : (
          <button
            onClick={() => setCurrentIdx(Math.min(questions.length - 1, currentIdx + 1))}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg shadow hover:bg-green-600 transition font-bold"
          >
            下一題 <ArrowRight size={18} />
          </button>
        )}
      </div>
    </div>
  );
};

export default QuizInterface;