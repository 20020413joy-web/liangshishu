import React, { useState, useEffect } from 'react';

interface StructuredInputProps {
  correctAnswer: string;
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}

const StructuredInput: React.FC<StructuredInputProps> = ({ correctAnswer, value, onChange, disabled }) => {
  // 解析題目結構：純數字、根號、或分數
  const parseStructure = () => {
    if (correctAnswer.includes('\\sqrt')) {
      const parts = correctAnswer.split('\\sqrt');
      const outside = parts[0].replace(/[{}]/g, '');
      const inside = parts[1].replace(/[{}]/g, '');
      return { type: 'root', parts: [outside, inside] };
    } else if (correctAnswer.includes('/')) {
      const parts = correctAnswer.split('/');
      return { type: 'fraction', parts: [parts[0], parts[1]] };
    }
    return { type: 'number', parts: [correctAnswer] };
  };

  const structure = parseStructure();
  const [subValues, setSubValues] = useState<string[]>([]);

  useEffect(() => {
    // 根據結構初始化輸入區塊的數量
    setSubValues(Array(structure.parts.length).fill(''));
  }, [correctAnswer]);

  const handleBlockChange = (idx: number, newVal: string) => {
    if (disabled) return;
    const newSubValues = [...subValues];
    newSubValues[idx] = newVal;
    setSubValues(newSubValues);

    // 重組 LaTeX 字串回傳給父組件進行檢查
    let finalStr = '';
    if (structure.type === 'number') {
      finalStr = newSubValues[0];
    } else if (structure.type === 'root') {
      const [outVal, inVal] = newSubValues;
      // 處理 LaTeX 根號格式
      finalStr = `${outVal}\\sqrt{${inVal}}`;
    } else if (structure.type === 'fraction') {
      const [numVal, denVal] = newSubValues;
      finalStr = `${numVal}/${denVal}`;
    }
    onChange(finalStr);
  };

  const renderInputBox = (idx: number, placeholder: string = "", width: string = "w-16") => (
    <input
      key={idx}
      type="text"
      disabled={disabled}
      placeholder={placeholder}
      value={subValues[idx] || ''}
      onChange={(e) => handleBlockChange(idx, e.target.value)}
      className={`${width} h-12 border-2 border-gray-200 rounded-xl text-center text-xl font-black focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all bg-white shadow-inner disabled:bg-gray-50 disabled:text-gray-400`}
    />
  );

  return (
    <div className="flex items-center justify-center p-4">
      {structure.type === 'number' && (
        <div className="flex items-center gap-2">
          {renderInputBox(0, "Ans", "w-32")}
        </div>
      )}

      {structure.type === 'root' && (
        <div className="flex items-center gap-1">
          {/* 根號外的係數 */}
          {renderInputBox(0, "", "w-14")}
          
          <div className="flex items-center ml-1">
            <span className="text-4xl font-light text-neutral mb-1 italic">√</span>
            <div className="border-t-2 border-neutral pt-1.5 -ml-1">
              {/* 根號內的數值 */}
              {renderInputBox(1, "", "w-14")}
            </div>
          </div>
        </div>
      )}

      {structure.type === 'fraction' && (
        <div className="flex flex-col items-center gap-2">
          {/* 分子 */}
          {renderInputBox(0, "分子", "w-20")}
          
          {/* 分數線 */}
          <div className="w-24 h-1 bg-neutral rounded-full"></div>
          
          {/* 分母 */}
          {renderInputBox(1, "分母", "w-20")}
        </div>
      )}
    </div>
  );
};

export default StructuredInput;