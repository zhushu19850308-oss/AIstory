/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Dices, Send, User, MapPin, Gift, Loader2, RefreshCw, ChevronRight } from "lucide-react";

// Initialize Gemini AI
const API_KEY = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenAI({ apiKey: API_KEY });

interface StorySegment {
  text: string;
  id: string;
}

export default function App() {
  const [character, setCharacter] = useState('');
  const [location, setLocation] = useState('');
  const [element, setElement] = useState('');
  const [storySegments, setStorySegments] = useState<StorySegment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const storyEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (storyEndRef.current) {
      storyEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [storySegments]);

  const generateStoryOpening = async () => {
    if (!character || !location || !element) {
      setError("请填满三个词哦，这样故事才能发芽！🌱");
      return;
    }

    setIsLoading(true);
    setError(null);
    setStorySegments([]);

    try {
      if (!API_KEY) {
        setError("检测到未配置 API Key。如果您在 Vercel 部署，请在 Environment Variables 中添加 GEMINI_API_KEY。");
        setIsLoading(false);
        return;
      }
      const model = "gemini-3-flash-preview";
      const prompt = `你是一位充满想象力的儿童故事作家。用户给了你三个词：角色 = ${character}, 地点 = ${location}, 神秘元素 = ${element}。
请写一段引人入胜的故事开头，字数在 150–200 字左右。
要求：开头有悬念，语言生动有画面感，适合 8–12 岁孩子阅读，结尾用省略号…… 留下悬念，只返回故事正文，不要标题。请使用中文。`;

      const response = await genAI.models.generateContent({
        model,
        contents: prompt,
      });

      const text = response.text || "哎呀，故事种子好像没能发芽，再试一次吧？";
      setStorySegments([{ text, id: Math.random().toString(36).substr(2, 9) }]);
    } catch (err) {
      console.error(err);
      setError("糟糕，魔法失灵了！请检查网络或稍后再试。");
    } finally {
      setIsLoading(false);
    }
  };

  const continueStory = async () => {
    if (storySegments.length === 0) return;

    setIsLoading(true);
    setError(null);

    try {
      const fullStory = storySegments.map(s => s.text).join('\n\n');
      const model = "gemini-3-flash-preview";
      const prompt = `你是一位充满想象力的儿童故事作家。这是你之前写的故事内容：
${fullStory}

请接着上面的故事继续写下一段，字数在 150–200 字左右。
要求：保持之前的风格，情节紧凑，适合 8–12 岁孩子阅读，结尾继续用省略号…… 留下悬念，只返回故事正文，不要重复之前的内容。请使用中文。`;

      const response = await genAI.models.generateContent({
        model,
        contents: prompt,
      });

      const text = response.text || "故事在这里卡住了，再试一次继续魔法吧！";
      setStorySegments(prev => [...prev, { text, id: Math.random().toString(36).substr(2, 9) }]);
    } catch (err) {
      console.error(err);
      setError("魔法中断了，请再试一次继续故事。");
    } finally {
      setIsLoading(false);
    }
  };

  const resetStory = () => {
    setCharacter('');
    setLocation('');
    setElement('');
    setStorySegments([]);
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-8 px-4 sm:px-6">
      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-10"
      >
        <h1 className="text-4xl sm:text-5xl font-display text-slate-800 mb-4 drop-shadow-sm">
          AI 故事种子生成器 🌱
        </h1>
        <p className="text-lg text-slate-600 font-cute">
          给我 3 个词，AI 帮你开始一个故事！
        </p>
      </motion.div>

      {/* Input Section */}
      <motion.div 
        layout
        className="w-full max-w-2xl bg-white/80 backdrop-blur-sm rounded-3xl p-6 sm:p-8 shadow-xl border-4 border-white mb-8"
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 ml-1">
              <User size={16} className="text-lavender-dark" /> 角色
            </label>
            <input 
              type="text" 
              placeholder="例如：机器人"
              value={character}
              onChange={(e) => setCharacter(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-lavender border-2 border-transparent focus:border-lavender-dark outline-none transition-all placeholder:text-slate-400"
            />
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 ml-1">
              <MapPin size={16} className="text-mint-dark" /> 地点
            </label>
            <input 
              type="text" 
              placeholder="例如：深海"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-mint border-2 border-transparent focus:border-mint-dark outline-none transition-all placeholder:text-slate-400"
            />
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 ml-1">
              <Gift size={16} className="text-soft-yellow-dark" /> 神秘元素
            </label>
            <input 
              type="text" 
              placeholder="例如：一封信"
              value={element}
              onChange={(e) => setElement(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-soft-yellow border-2 border-transparent focus:border-soft-yellow-dark outline-none transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="flex flex-col items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={generateStoryOpening}
            disabled={isLoading}
            className={`
              w-full sm:w-auto px-10 py-4 rounded-full text-xl font-bold shadow-lg flex items-center justify-center gap-3 transition-all
              ${isLoading ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-mint-dark to-lavender-dark text-slate-800 hover:shadow-xl'}
            `}
          >
            {isLoading && storySegments.length === 0 ? <Loader2 className="animate-spin" /> : <Sparkles />}
            🌱 种下故事种子！
          </motion.button>
          
          {error && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-500 font-medium text-sm"
            >
              {error}
            </motion.p>
          )}
        </div>
      </motion.div>

      {/* Story Display Section */}
      <AnimatePresence>
        {storySegments.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-3xl mb-12"
          >
            <div className="storybook-card bg-paper rounded-3xl p-8 sm:p-12 shadow-2xl border-8 border-white relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-mint-dark/30 rounded-tl-3xl"></div>
              <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-lavender-dark/30 rounded-br-3xl"></div>
              
              <div className="space-y-8 relative z-10">
                {storySegments.map((segment, index) => (
                  <motion.div 
                    key={segment.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="text-xl sm:text-2xl leading-relaxed text-slate-700 font-serif italic"
                  >
                    {segment.text}
                  </motion.div>
                ))}
                <div ref={storyEndRef} />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={continueStory}
                disabled={isLoading}
                className="px-8 py-3 rounded-full bg-white text-slate-700 font-bold shadow-md hover:shadow-lg flex items-center gap-2 border-2 border-mint-dark disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="animate-spin" size={18} /> : <ChevronRight size={18} />}
                ✨ 继续故事
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={resetStory}
                className="px-8 py-3 rounded-full bg-white text-slate-700 font-bold shadow-md hover:shadow-lg flex items-center gap-2 border-2 border-lavender-dark"
              >
                <Dices size={18} />
                🎲 换 3 个词重来
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <div className="mt-auto pt-8 text-center">
        <p className="text-slate-500 font-cute flex items-center justify-center gap-2">
          <span>💡</span> 试着改变词语，看看会发生什么不同的故事！
        </p>
      </div>
    </div>
  );
}
