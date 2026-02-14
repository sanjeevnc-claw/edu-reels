'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  REEL_DURATIONS,
  ELEVENLABS_VOICES,
  STYLE_PRESETS,
  DEFAULT_VOICE_SETTINGS,
  DEFAULT_AVATAR_SETTINGS,
  estimateWordCount,
} from '@/lib/shared';
import type { Concept, AvatarMode, ReelStyle, CaptionStyle } from '@/lib/shared';

type Step = 'concept' | 'voice' | 'avatar' | 'style' | 'preview';

const STEPS: { id: Step; label: string }[] = [
  { id: 'concept', label: 'Concept' },
  { id: 'voice', label: 'Voice' },
  { id: 'avatar', label: 'Avatar' },
  { id: 'style', label: 'Style' },
  { id: 'preview', label: 'Preview' },
];

const btnBase = "px-4 py-3 rounded-xl font-medium transition-all";
const btnActive = "text-white";
const btnInactive = "text-gray-400 hover:text-gray-200";
const inputStyle = {
  background: 'rgba(30, 41, 59, 0.5)',
  border: '1px solid rgba(71, 85, 105, 0.5)',
};
const cardStyle = {
  background: 'rgba(30, 41, 59, 0.3)',
  border: '1px solid rgba(71, 85, 105, 0.3)',
};
const gradientBtn = {
  background: 'linear-gradient(135deg, #9333ea 0%, #db2777 100%)',
  boxShadow: '0 10px 30px -10px rgba(168, 85, 247, 0.5)',
};

export default function CreatePage() {
  const [step, setStep] = useState<Step>('concept');
  const [loading, setLoading] = useState(false);
  const [script, setScript] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [concept, setConcept] = useState<Concept>({
    id: '', topic: '', targetAudience: '', keyPoints: [], tone: 'educational', duration: 60,
  });
  const [voiceId, setVoiceId] = useState(DEFAULT_VOICE_SETTINGS.voiceId);
  const [avatarMode, setAvatarMode] = useState<AvatarMode>('faceless');
  const [avatarPosition, setAvatarPosition] = useState<string>(DEFAULT_AVATAR_SETTINGS.position);
  const [visualStyle, setVisualStyle] = useState<ReelStyle>('modern_minimal');
  const [captionStyle, setCaptionStyle] = useState<CaptionStyle>('tiktok_bounce');

  const stepIdx = STEPS.findIndex((s) => s.id === step);
  const progress = ((stepIdx + 1) / STEPS.length) * 100;

  const next = () => stepIdx < STEPS.length - 1 && setStep(STEPS[stepIdx + 1].id);
  const prev = () => stepIdx > 0 && setStep(STEPS[stepIdx - 1].id);

  const generateScript = async () => {
    if (!concept.topic.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ concept }),
      });
      const data = await res.json();
      if (res.ok && data.script) {
        setScript(data.script.fullScript || JSON.stringify(data.script, null, 2));
      } else {
        setError(data.error || 'Failed to generate script');
      }
    } catch {
      setError('Network error');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen" style={{ background: '#0f172a' }}>
      {/* Header */}
      <header 
        className="sticky top-0 z-50 border-b"
        style={{ background: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(10px)', borderColor: 'rgba(71, 85, 105, 0.3)' }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)' }}
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="font-bold text-xl text-white hidden sm:block">EduReels</span>
            </Link>
            <div className="text-sm text-gray-400">
              {concept.duration || 60}s • ~{estimateWordCount(concept.duration || 60)} words
            </div>
          </div>

          {/* Steps */}
          <div className="pb-4">
            <div className="flex gap-2 mb-3 overflow-x-auto">
              {STEPS.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => setStep(s.id)}
                  className={`${btnBase} whitespace-nowrap ${s.id === step ? btnActive : btnInactive}`}
                  style={s.id === step ? { background: '#a855f7' } : i < stepIdx ? { background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80' } : { background: 'rgba(51, 65, 85, 0.5)' }}
                >
                  {i < stepIdx ? '✓ ' : ''}{s.label}
                </button>
              ))}
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(51, 65, 85, 0.5)' }}>
              <div 
                className="h-full transition-all duration-500"
                style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #a855f7 0%, #ec4899 100%)' }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 pb-32">
        {step === 'concept' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">What do you want to teach?</h1>
              <p className="text-gray-400">Enter your concept and AI will generate a viral-ready script.</p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Topic / Concept</label>
                <input
                  type="text"
                  value={concept.topic}
                  onChange={(e) => setConcept({ ...concept, topic: e.target.value })}
                  placeholder="e.g., Why compound interest is the 8th wonder"
                  className="w-full px-4 py-4 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  style={inputStyle}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Duration</label>
                <div className="grid grid-cols-4 gap-2">
                  {REEL_DURATIONS.map((d) => (
                    <button
                      key={d}
                      onClick={() => setConcept({ ...concept, duration: d })}
                      className="py-3 rounded-xl font-medium transition-all"
                      style={concept.duration === d ? { ...gradientBtn, color: 'white' } : { ...inputStyle, color: '#cbd5e1' }}
                    >
                      {d}s
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Tone</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['educational', 'casual', 'professional', 'entertaining'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setConcept({ ...concept, tone: t })}
                      className="py-3 rounded-xl font-medium capitalize transition-all"
                      style={concept.tone === t ? { ...gradientBtn, color: 'white' } : { ...inputStyle, color: '#cbd5e1' }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Target Audience (optional)</label>
                <input
                  type="text"
                  value={concept.targetAudience || ''}
                  onChange={(e) => setConcept({ ...concept, targetAudience: e.target.value })}
                  placeholder="e.g., Beginners interested in finance"
                  className="w-full px-4 py-4 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  style={inputStyle}
                />
              </div>

              <button
                onClick={generateScript}
                disabled={!concept.topic.trim() || loading}
                className="w-full py-4 rounded-xl font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                style={gradientBtn}
              >
                {loading ? '⏳ Generating...' : '✨ Generate Script with AI'}
              </button>

              {error && (
                <div className="p-4 rounded-xl text-red-400" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                  {error}
                </div>
              )}

              {script && (
                <div className="p-5 rounded-xl" style={cardStyle}>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-semibold text-purple-400">✨ Generated Script</span>
                    <button onClick={() => setScript(null)} className="text-xs text-gray-500 hover:text-gray-300">Clear</button>
                  </div>
                  <p className="text-gray-300 whitespace-pre-wrap text-sm leading-relaxed">{script}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {step === 'voice' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Choose a Voice</h1>
              <p className="text-gray-400">Select the voice for your reel narration.</p>
            </div>
            <div className="space-y-3">
              {ELEVENLABS_VOICES.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setVoiceId(v.id)}
                  className="w-full p-5 rounded-xl text-left transition-all flex items-center justify-between"
                  style={voiceId === v.id ? { background: 'rgba(168, 85, 247, 0.2)', border: '2px solid #a855f7' } : { ...cardStyle, border: '2px solid transparent' }}
                >
                  <div>
                    <div className="font-semibold text-lg text-white">{v.name}</div>
                    <div className="text-sm text-gray-400 capitalize">{v.gender} • {v.style}</div>
                  </div>
                  {voiceId === v.id && <span className="text-purple-400">✓</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'avatar' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Avatar Settings</h1>
              <p className="text-gray-400">Choose between face or faceless style.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { id: 'faceless' as const, label: 'Faceless', emoji: '🎨', desc: 'Animated visuals' },
                { id: 'face' as const, label: 'With Face', emoji: '👤', desc: 'AI avatar' },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setAvatarMode(m.id)}
                  className="p-6 rounded-xl text-center transition-all"
                  style={avatarMode === m.id ? { background: 'rgba(168, 85, 247, 0.2)', border: '2px solid #a855f7' } : { ...cardStyle, border: '2px solid transparent' }}
                >
                  <div className="text-4xl mb-2">{m.emoji}</div>
                  <div className="font-semibold text-white">{m.label}</div>
                  <div className="text-xs text-gray-400 mt-1">{m.desc}</div>
                </button>
              ))}
            </div>
            {avatarMode === 'face' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">Position</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'corner_br', label: 'Bottom R', emoji: '↘️' },
                    { id: 'corner_bl', label: 'Bottom L', emoji: '↙️' },
                    { id: 'bottom_third', label: 'Bottom', emoji: '⬇️' },
                    { id: 'corner_tr', label: 'Top R', emoji: '↗️' },
                    { id: 'corner_tl', label: 'Top L', emoji: '↖️' },
                    { id: 'full', label: 'Full', emoji: '🖼️' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setAvatarPosition(p.id)}
                      className="p-3 rounded-xl text-center transition-all"
                      style={avatarPosition === p.id ? { background: 'rgba(168, 85, 247, 0.2)', border: '2px solid #a855f7' } : { ...cardStyle, border: '2px solid transparent' }}
                    >
                      <div className="text-xl mb-1">{p.emoji}</div>
                      <div className="text-xs text-gray-300">{p.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {step === 'style' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Visual Style</h1>
              <p className="text-gray-400">Choose the look and feel.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">Style Preset</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {(Object.keys(STYLE_PRESETS) as ReelStyle[]).map((s) => {
                  const p = STYLE_PRESETS[s];
                  return (
                    <button
                      key={s}
                      onClick={() => setVisualStyle(s)}
                      className="p-3 rounded-xl text-center transition-all"
                      style={visualStyle === s ? { outline: '2px solid #a855f7', outlineOffset: '2px' } : {}}
                    >
                      <div className="h-14 rounded-lg mb-2" style={{ background: `linear-gradient(135deg, ${p.primaryColor}, ${p.secondaryColor})` }} />
                      <div className="text-sm text-white capitalize">{s.replace('_', ' ')}</div>
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">Caption Style</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'tiktok_bounce', label: 'TikTok Bounce', emoji: '⬆️' },
                  { id: 'highlight_word', label: 'Highlight', emoji: '🟡' },
                  { id: 'karaoke', label: 'Karaoke', emoji: '🎤' },
                  { id: 'subtitle_classic', label: 'Classic', emoji: '📝' },
                ].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setCaptionStyle(c.id as CaptionStyle)}
                    className="p-4 rounded-xl text-center transition-all"
                    style={captionStyle === c.id ? { background: 'rgba(168, 85, 247, 0.2)', border: '2px solid #a855f7' } : { ...cardStyle, border: '2px solid transparent' }}
                  >
                    <div className="text-2xl mb-1">{c.emoji}</div>
                    <div className="text-sm text-white">{c.label}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 'preview' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Preview & Generate</h1>
              <p className="text-gray-400">Review and generate your reel.</p>
            </div>
            <div className="p-6 rounded-xl" style={cardStyle}>
              <h3 className="font-semibold text-lg text-white mb-4">Summary</h3>
              <div className="space-y-3 text-sm">
                {[
                  ['Topic', concept.topic || '—'],
                  ['Duration', `${concept.duration}s`],
                  ['Voice', ELEVENLABS_VOICES.find((v) => v.id === voiceId)?.name || voiceId],
                  ['Avatar', avatarMode],
                  ['Style', visualStyle.replace('_', ' ')],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between py-2" style={{ borderBottom: '1px solid rgba(71, 85, 105, 0.3)' }}>
                    <span className="text-gray-400">{k}</span>
                    <span className="text-white capitalize">{v}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-6 rounded-xl text-center" style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
              <div className="text-4xl mb-2">✅</div>
              <h3 className="font-semibold text-green-400 text-xl">Ready to Generate!</h3>
            </div>
            <button className="w-full py-4 rounded-xl font-semibold text-white transition-all" style={gradientBtn}>
              🎬 Generate Reel
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer 
        className="fixed bottom-0 left-0 right-0 p-4 border-t"
        style={{ background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(10px)', borderColor: 'rgba(71, 85, 105, 0.3)' }}
      >
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          <button
            onClick={prev}
            disabled={stepIdx === 0}
            className="px-4 py-3 text-gray-400 hover:text-white disabled:text-gray-600 disabled:cursor-not-allowed transition-colors"
          >
            ← Previous
          </button>
          <button
            onClick={next}
            disabled={stepIdx === STEPS.length - 1}
            className="flex-1 sm:flex-none px-8 py-3 rounded-xl font-semibold text-white disabled:opacity-50 transition-all"
            style={gradientBtn}
          >
            {stepIdx === STEPS.length - 1 ? 'Generate' : 'Next →'}
          </button>
        </div>
      </footer>
    </div>
  );
}
