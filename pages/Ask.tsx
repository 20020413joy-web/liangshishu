import React, { useState, useRef, useEffect } from 'react';
import { Send, Image as ImageIcon, User, Bot, X, Paperclip } from 'lucide-react';
import MathRenderer from '../components/MathRenderer';

interface Message {
  id: string;
  sender: 'user' | 'teacher';
  content: string;
  timestamp: string;
  image?: string;
}

const Ask: React.FC = () => {
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'teacher',
      content: '同學好！我是良師塾的輔導老師。關於課程內容或題目有任何問題，都可以隨時傳送文字或題目圖片給我，我會盡快為您解答！',
      timestamp: '10:00 AM'
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = () => {
    if (!input.trim() && !selectedImage) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      content: input,
      image: selectedImage || undefined,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMessage]);
    setInput('');
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';

    // Mock teacher reply
    setTimeout(() => {
      const reply: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'teacher',
        content: selectedImage 
          ? '收到您上傳的題目圖片了！老師正在解題中，稍後會將解題流程回傳給您。' 
          : '收到您的問題了！老師正在解題中，預計 24 小時內回覆您。',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, reply]);
    }, 1200);
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-140px)] flex flex-col bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
            <Bot className="text-primary" size={24} />
          </div>
          <div>
            <h2 className="font-black text-neutral">數學輔導室</h2>
            <p className="text-[10px] text-green-600 font-black flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              輔導老師在線
            </p>
          </div>
        </div>
        <div className="text-[10px] text-gray-300 font-bold uppercase tracking-tighter">Liang Shi Shu Support</div>
      </div>

      {/* Messages */}
      <div className="flex-grow overflow-y-auto p-6 space-y-6 bg-slate-50/30">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex items-end max-w-[85%] gap-2 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center shadow-sm ${msg.sender === 'user' ? 'bg-gray-100 border border-gray-200' : 'bg-primary text-white'}`}>
                {msg.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={`p-4 rounded-2xl flex flex-col gap-3 ${msg.sender === 'user' ? 'bg-primary text-white rounded-tr-none' : 'bg-white text-gray-800 rounded-tl-none shadow-sm border border-gray-100'}`}>
                {msg.image && (
                  <div className="rounded-xl overflow-hidden border border-white/20">
                    <img src={msg.image} alt="User uploaded" className="max-w-full h-auto max-h-64 object-contain bg-black/5" />
                  </div>
                )}
                {msg.content && (
                  <div className="text-sm font-medium leading-relaxed">
                    <MathRenderer>{msg.content}</MathRenderer>
                  </div>
                )}
                <div className={`text-[9px] font-bold ${msg.sender === 'user' ? 'text-white/50 text-right' : 'text-gray-400'}`}>
                  {msg.timestamp}
                </div>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-100">
        {/* Image Preview */}
        {selectedImage && (
          <div className="mb-4 relative inline-block">
            <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-primary/20 shadow-md">
              <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
            </div>
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition"
            >
              <X size={14} />
            </button>
          </div>
        )}

        <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-2xl border border-gray-100">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageSelect} 
            accept="image/*" 
            className="hidden" 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className={`p-3 transition rounded-xl ${selectedImage ? 'bg-primary text-white' : 'text-gray-400 hover:text-primary bg-white shadow-sm'}`} 
            title="上傳題目圖片"
          >
            <ImageIcon size={20} />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="請輸入您的問題或貼上 LaTeX 公式..."
            className="flex-grow outline-none text-sm font-bold bg-transparent px-2"
          />
          <button 
            onClick={handleSend} 
            disabled={!input.trim() && !selectedImage}
            className={`p-3 rounded-xl transition shadow-md ${input.trim() || selectedImage ? 'bg-primary text-white scale-100' : 'bg-gray-200 text-gray-400 cursor-not-allowed scale-95'}`}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Ask;
