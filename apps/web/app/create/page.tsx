'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Zap,
  Sparkles,
  Mic,
  User,
  Palette,
  Play,
  Download,
  RefreshCw,
  Check,
  Clock,
  Volume2,
} from 'lucide-react';
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

const STEPS: { id: Step; label: string; icon: React.ElementType }[] = [
  { id: 'concept', label: 'Concept', icon: Sparkles },
  { id: 'voice', label: 'Voice', icon: Mic },
  { id: 'avatar', label: 'Avatar', icon: User },
  { id: 'style', label: 'Style', icon: Palette },
  { id: 'preview', label: 'Preview', icon: Play },
];

export default function CreatePage() {
  const [step, setStep] = useState<Step>('concept');
  const [loading, setLoading] = useState(false);
  const [script, setScript] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [concept, setConcept] = useState<Concept>({
    id: '',
    topic: '',
    targetAudience: '',
    keyPoints: [],
    tone: 'educational',
    duration: 60,
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
    } catch (e) {
      setError('Network error. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#0f172a]/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg">EduReels</span>
          </Link>
          <div className="flex items-center gap-2 text-sm text-white/60">
            <Clock className="w-4 h-4" />
            <span>{concept.duration}s • ~{estimateWordCount(concept.duration || 60)} words</span>
          </div>
        </div>
        
        {/* Progress */}
        <div className="max-w-5xl mx-auto px-4 pb-3">
          <div className="flex items-center gap-2 mb-2">
            {STEPS.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setStep(s.id)}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
                  s.id === step
                    ? 'bg-purple-500 text-white'
                    : i < stepIdx
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-white/5 text-white/40'
                }`}
              >
                {i < stepIdx ? <Check className="w-3.5 h-3.5" /> : <s.icon className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{s.label}</span>
              </button>
            ))}
          </div>
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 py-8 pb-32">
        {step === 'concept' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold mb-2">What do you want to teach?</h1>
              <p className="text-white/60">Enter your concept and AI will generate a viral-ready script.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Topic / Concept</label>
                <input
                  type="text"
                  value={concept.topic}
                  onChange={(e) => setConcept({ ...concept, topic: e.target.value })}
                  placeholder="e.g., Why compound interest is the 8th wonder"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Duration</label>
                <div className="grid grid-cols-4 gap-2">
                  {REEL_DURATIONS.map((d) => (
                    <button
                      key={d}
                      onClick={() => setConcept({ ...concept, duration: d })}
                      className={`py-3 rounded-xl font-medium transition-all ${
                        concept.duration === d
                          ? 'bg-purple-500 text-white'
                          : 'bg-white/5 text-white/60 hover:bg-white/10'
                      }`}
                    >
                      {d}s
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tone</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['educational', 'casual', 'professional', 'entertaining'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setConcept({ ...concept, tone: t })}
                      className={`py-3 rounded-xl font-medium capitalize transition-all ${
                        concept.tone === t
                          ? 'bg-purple-500 text-white'
                          : 'bg-white/5 text-white/60 hover:bg-white/10'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Target Audience (optional)</label>
                <input
                  type="text"
                  value={concept.targetAudience || ''}
                  onChange={(e) => setConcept({ ...concept, targetAudience: e.target.value })}
                  placeholder="e.g., Beginners interested in finance"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <button
                onClick={generateScript}
                disabled={!concept.topic.trim() || loading}
                className="w-full py-4 rounded-xl font-medium bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Script with AI
                  </>
                )}
              </button>

              {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
                  {error}
                </div>
              )}

              {script && (
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-purple-400">Generated Script</span>
                    <button
                      onClick={() => setScript(null)}
                      className="text-xs text-white/40 hover:text-white"
                    >
                      Clear
                    </button>
                  </div>
                  <p className="text-white/80 whitespace-pre-wrap text-sm leading-relaxed">{script}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {step === 'voice' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold mb-2">Choose a Voice</h1>
              <p className="text-white/60">Select the voice for your reel narration.</p>
            </div>
            <div className="grid gap-3">
              {ELEVENLABS_VOICES.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setVoiceId(v.id)}
                  className={`p-4 rounded-xl text-left transition-all flex items-center justify-between ${
                    voiceId === v.id
                      ? 'bg-purple-500/20 border-2 border-purple-500'
                      : 'bg-white/5 border-2 border-transparent hover:bg-white/10'
                  }`}
                >
                  <div>
                    <div className="font-semibold text-lg">{v.name}</div>
                    <div className="text-sm text-white/60 capitalize">{v.gender} • {v.style}</div>
                  </div>
                  <Volume2 className="w-5 h-5 text-white/40" />
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'avatar' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold mb-2">Avatar Settings</h1>
              <p className="text-white/60">Choose between face or faceless style.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'faceless', label: 'Faceless', emoji: '🎨', desc: 'Animated visuals + B-roll' },
                { id: 'face', label: 'With Face', emoji: '👤', desc: 'AI avatar or your own' },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setAvatarMode(m.id as AvatarMode)}
                  className={`p-6 rounded-xl text-center transition-all ${
                    avatarMode === m.id
                      ? 'bg-purple-500/20 border-2 border-purple-500'
                      : 'bg-white/5 border-2 border-transparent hover:bg-white/10'
                  }`}
                >
                  <div className="text-4xl mb-2">{m.emoji}</div>
                  <div className="font-semibold">{m.label}</div>
                  <div className="text-xs text-white/60 mt-1">{m.desc}</div>
                </button>
              ))}
            </div>
            {avatarMode === 'face' && (
              <div>
                <label className="block text-sm font-medium mb-3">Avatar Position</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'corner_br', label: 'Bottom Right', emoji: '↘️' },
                    { id: 'corner_bl', label: 'Bottom Left', emoji: '↙️' },
                    { id: 'bottom_third', label: 'Bottom', emoji: '⬇️' },
                    { id: 'corner_tr', label: 'Top Right', emoji: '↗️' },
                    { id: 'corner_tl', label: 'Top Left', emoji: '↖️' },
                    { id: 'full', label: 'Full Screen', emoji: '🖼️' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setAvatarPosition(p.id)}
                      className={`p-3 rounded-xl text-center transition-all ${
                        avatarPosition === p.id
                          ? 'bg-purple-500/20 border-2 border-purple-500'
                          : 'bg-white/5 border-2 border-transparent hover:bg-white/10'
                      }`}
                    >
                      <div className="text-xl mb-1">{p.emoji}</div>
                      <div className="text-xs text-white/70">{p.label}</div>
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
              <h1 className="text-2xl font-bold mb-2">Visual Style</h1>
              <p className="text-white/60">Choose the look and feel of your reel.</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-3">Style Preset</label>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(STYLE_PRESETS) as ReelStyle[]).map((s) => {
                  const p = STYLE_PRESETS[s];
                  return (
                    <button
                      key={s}
                      onClick={() => setVisualStyle(s)}
                      className={`p-3 rounded-xl text-center transition-all ${
                        visualStyle === s
                          ? 'ring-2 ring-purple-500'
                          : 'hover:bg-white/5'
                      }`}
                    >
                      <div
                        className="h-12 rounded-lg mb-2"
                        style={{ background: `linear-gradient(135deg, ${p.primaryColor}, ${p.secondaryColor})` }}
                      />
                      <div className="text-xs capitalize text-white/80">{s.replace('_', ' ')}</div>
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-3">Caption Style</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'tiktok_bounce', label: 'TikTok Bounce', emoji: '⬆️' },
                  { id: 'highlight_word', label: 'Highlight', emoji: '🟡' },
                  { id: 'karaoke', label: 'Karaoke', emoji: '🎤' },
                  { id: 'subtitle_classic', label: 'Classic', emoji: '📝' },
                ].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setCaptionStyle(c.id as CaptionStyle)}
                    className={`p-4 rounded-xl text-center transition-all ${
                      captionStyle === c.id
                        ? 'bg-purple-500/20 border-2 border-purple-500'
                        : 'bg-white/5 border-2 border-transparent hover:bg-white/10'
                    }`}
                  >
                    <div className="text-2xl mb-1">{c.emoji}</div>
                    <div className="text-sm">{c.label}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 'preview' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold mb-2">Preview & Generate</h1>
              <p className="text-white/60">Review your settings and generate your reel.</p>
            </div>
            <div className="p-6 rounded-xl bg-white/5 border border-white/10 space-y-4">
              <h3 className="font-semibold text-lg">Summary</h3>
              <div className="space-y-3 text-sm">
                {[
                  ['Topic', concept.topic || '—'],
                  ['Duration', `${concept.duration} seconds`],
                  ['Tone', concept.tone],
                  ['Voice', ELEVENLABS_VOICES.find((v) => v.id === voiceId)?.name || voiceId],
                  ['Avatar', avatarMode === 'faceless' ? 'Faceless' : `Face (${avatarPosition})`],
                  ['Style', visualStyle.replace('_', ' ')],
                  ['Captions', captionStyle.replace('_', ' ')],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <span className="text-white/60">{k}</span>
                    <span className="capitalize">{v}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-6 rounded-xl bg-green-500/10 border border-green-500/20 text-center">
              <Check className="w-12 h-12 text-green-400 mx-auto mb-3" />
              <h3 className="font-semibold text-green-400 text-lg">Ready to Generate!</h3>
              <p className="text-sm text-white/60 mt-1">Click below to create your reel.</p>
            </div>
            <button className="w-full py-4 rounded-xl font-medium bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all flex items-center justify-center gap-2">
              <Download className="w-5 h-5" />
              Generate Reel
            </button>
          </div>
        )}
      </main>

      {/* Footer Nav */}
      <footer className="fixed bottom-0 left-0 right-0 bg-[#0f172a]/95 backdrop-blur border-t border-white/10 p-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          <button
            onClick={prev}
            disabled={stepIdx === 0}
            className="px-4 py-2 text-white/60 hover:text-white disabled:text-white/20 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Previous</span>
          </button>
          <button
            onClick={next}
            disabled={stepIdx === STEPS.length - 1}
            className="flex-1 sm:flex-none px-6 py-3 rounded-xl font-medium bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {stepIdx === STEPS.length - 1 ? 'Generate' : 'Next'}
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </footer>
    </div>
  );
}
