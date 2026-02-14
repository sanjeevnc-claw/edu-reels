'use client';

import Link from 'next/link';
import { Zap, Sparkles, Play, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <span className="font-bold text-xl">EduReels</span>
          </div>
          <Link
            href="/create"
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors font-medium"
          >
            Create Reel
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-5xl mx-auto px-4 py-20">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            AI-Powered Educational Content
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Turn Ideas into
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"> Viral Reels</span>
          </h1>
          
          <p className="text-lg text-white/60 mb-10 max-w-2xl mx-auto">
            Create engaging educational short-form videos in minutes. 
            AI generates scripts, adds voiceovers, and produces TikTok-ready content.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/create"
              className="px-8 py-4 rounded-xl font-semibold bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all flex items-center justify-center gap-2"
            >
              Start Creating
              <ArrowRight className="w-5 h-5" />
            </Link>
            <button className="px-8 py-4 rounded-xl font-semibold bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center gap-2">
              <Play className="w-5 h-5" />
              Watch Demo
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mt-20">
          {[
            {
              title: 'AI Script Generation',
              desc: 'Enter a topic, get a viral-ready script with hooks, key points, and CTAs.',
              emoji: '✍️',
            },
            {
              title: 'Natural Voiceovers',
              desc: 'Choose from multiple AI voices or use your own. ElevenLabs quality.',
              emoji: '🎙️',
            },
            {
              title: 'Auto Visual Styling',
              desc: 'TikTok-style captions, B-roll, and animations generated automatically.',
              emoji: '🎬',
            },
          ].map((f) => (
            <div
              key={f.title}
              className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors"
            >
              <div className="text-4xl mb-4">{f.emoji}</div>
              <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-white/60 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 mt-20">
        <div className="max-w-5xl mx-auto px-4 text-center text-white/40 text-sm">
          Built with AI • Powered by OpenAI, ElevenLabs, and Remotion
        </div>
      </footer>
    </div>
  );
}
