import React, { useState, useEffect, useRef } from 'react';
import { CHAPTERS } from '../mockData';
import { Play, ChevronDown, PenTool, Star, BookOpen, Settings2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Teach: React.FC = () => {
  const [activeVideo, setActiveVideo] = useState({ id: '1-1', title: '1-1 實數', videoId: 'x8v_pNX6bQY' });
  const [expandedChapter, setExpandedChapter] = useState<string | null>('1');
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // 當倍速改變時，發送指令給 YouTube
  useEffect(() => {
    if (isPlaying && iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(JSON.stringify({
        event: 'command',
        func: 'setPlaybackRate',
        args: [playbackSpeed]
      }), '*');
    }
  }, [playbackSpeed, isPlaying]);

  const handleStartPlay = () => {
    setIsPlaying(true);
    setIsLoading(true);
  };

  const handleChapterSelect = (sub: any) => {
    setActiveVideo({ id: sub.id, title: sub.title, videoId: sub.videoId || 'x8v_pNX6bQY' });
    setIsPlaying(true);
    setIsLoading(true);
    setPlaybackSpeed(1); // 切換章節時重置倍速
  };

  const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];

  return (
    <div className="space-y-6 pb-10">
      {/* 標題與課程資訊 */}
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-primary tracking-tight">良師塾：高一數學先修 (上) </h1>
          <p className="text-xs text-gray-400 font-bold mt-1 uppercase tracking-widest italic">
            當前播放：{activeVideo.title}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-[10px] font-black text-primary tracking-widest uppercase">HD 高畫質錄製</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* 左側：主播放器與控制區 */}
        <div className="flex-1 space-y-4">
          <div className="chalkboard-frame aspect-video relative overflow-hidden group shadow-2xl">
            {!isPlaying ? (
              /* 未播放時的封面狀態 - 解決瀏覽器阻擋問題 */
              <div 
                className="absolute inset-0 bg-chalkboard z-20 flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-[#5a7a4f]"
                onClick={handleStartPlay}
              >
                <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center border-4 border-white/20 backdrop-blur-md shadow-2xl group-hover:scale-110 transition-transform duration-500">
                  <Play size={40} fill="white" className="ml-2" />
                </div>
                <h3 className="mt-8 text-lg font-black text-white/90 tracking-[0.4em] uppercase">點擊開始觀看課程</h3>
                <p className="mt-2 text-xs text-white/40 font-bold italic">Liang Shi Shu Classroom</p>
              </div>
            ) : (
              /* 播放時狀態 */
              <>
                <AnimatePresence>
                  {isLoading && (
                    <motion.div 
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-chalkboard z-10 flex flex-col items-center justify-center text-white/30"
                    >
                      <Star className="animate-spin-slow mb-4" size={48} />
                      <p className="text-xs font-black uppercase tracking-widest">系統連線中...</p>
                    </motion.div>
                  )}
                </AnimatePresence>
                <iframe
                  ref={iframeRef}
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${activeVideo.videoId}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1`}
                  title={activeVideo.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  onLoad={() => setIsLoading(false)}
                  className="w-full h-full"
                ></iframe>
              </>
            )}
          </div>

          {/* 倍速控制欄 */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-50 rounded-xl text-primary">
                <Settings2 size={20} />
              </div>
              <span className="text-sm font-black text-neutral tracking-widest uppercase">播放倍速調節</span>
            </div>
            <div className="flex items-center gap-1.5 p-1 bg-gray-50 rounded-2xl border border-gray-100">
              {speeds.map((s) => (
                <button
                  key={s}
                  onClick={() => setPlaybackSpeed(s)}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                    playbackSpeed === s 
                      ? 'bg-primary text-white shadow-lg scale-105' 
                      : 'text-gray-400 hover:text-primary hover:bg-white'
                  }`}
                >
                  {s === 1 ? '1.0x (原速)' : `${s}x`}
                </button>
              ))}
            </div>
          </div>

          {/* 筆記區 */}
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 bg-green-50/50 flex items-center gap-2 text-primary font-black border-b border-green-100">
              <PenTool size={18} />
              <span className="tracking-widest">同步隨堂筆記</span>
            </div>
            <div className="p-6">
              <textarea 
                className="w-full h-40 p-5 bg-gray-50 border-2 border-gray-100 rounded-3xl outline-none text-sm font-medium placeholder:text-gray-300 focus:border-primary/20 transition resize-none"
                placeholder="在此記錄課程重點公式，例如 1-1 實數的定義與運算..."
              />
            </div>
          </div>
        </div>

        {/* 右側：章節選擇器 */}
        <div className="lg:w-80 space-y-4">
          <div className="flex items-center gap-2 text-neutral font-black text-lg px-2">
            <BookOpen className="text-primary" size={20} />
            課程章節目錄
          </div>
          
          <div className="space-y-3">
            {CHAPTERS.map((chapter) => (
              <div key={chapter.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <button 
                  onClick={() => setExpandedChapter(expandedChapter === chapter.id ? null : chapter.id)}
                  className="w-full flex items-center justify-between p-5 text-left transition-colors hover:bg-gray-50"
                >
                  <span className={`font-black text-sm ${expandedChapter === chapter.id ? 'text-primary' : 'text-neutral'}`}>
                    {chapter.title}
                  </span>
                  <ChevronDown className={`transition-transform duration-300 ${expandedChapter === chapter.id ? 'rotate-180 text-primary' : 'text-gray-300'}`} size={16} />
                </button>
                
                <AnimatePresence>
                  {expandedChapter === chapter.id && (
                    <motion.div
                      initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                      className="overflow-hidden bg-gray-50/30"
                    >
                      <div className="p-3 space-y-2">
                        {chapter.subChapters?.map((sub) => (
                          <button
                            key={sub.id}
                            onClick={() => handleChapterSelect(sub)}
                            className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all border ${
                              activeVideo.id === sub.id 
                                ? 'bg-primary text-white border-primary shadow-xl' 
                                : 'bg-white text-gray-500 hover:border-primary/20 hover:text-primary border-gray-50'
                            }`}
                          >
                            <div className="flex items-center gap-3 overflow-hidden">
                              <div className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center ${activeVideo.id === sub.id ? 'bg-white/20' : 'bg-green-100 text-primary'}`}>
                                <Play size={14} fill={activeVideo.id === sub.id ? "white" : "currentColor"} />
                              </div>
                              <span className="font-bold text-xs truncate tracking-tight">{sub.title}</span>
                            </div>
                            <div className="text-[8px] font-black opacity-40 italic">VIDEO</div>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Teach;