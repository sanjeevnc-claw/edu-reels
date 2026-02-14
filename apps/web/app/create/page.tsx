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
  DEFAULT_VISUAL_SETTINGS,
  estimateWordCount,
} from '@edu-reels/shared';
import type { Concept, AvatarMode, ReelStyle, CaptionStyle } from '@edu-reels/shared';

type Step = 'concept' | 'voice' | 'avatar' | 'style' | 'preview';

const STEPS: { id: Step; title: string; icon: React.ElementType }[] = [
  { id: 'concept', title: 'Concept', icon: Sparkles },
  { id: 'voice', title: 'Voice', icon: Mic },
  { id: 'avatar', title: 'Avatar', icon: User },
  { id: 'style', title: 'Style', icon: Palette },
  { id: 'preview', title: 'Preview', icon: Play },
];

export default function CreatePage() {
  const [currentStep, setCurrentStep] = useState<Step>('concept');
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [generatedScript, setGeneratedScript] = useState<string | null>(null);

  // Form state
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
  const [avatarPosition, setAvatarPosition] = useState(DEFAULT_AVATAR_SETTINGS.position);
  const [visualStyle, setVisualStyle] = useState<ReelStyle>('modern_minimal');
  const [captionStyle, setCaptionStyle] = useState<CaptionStyle>('tiktok_bounce');

  const stepIndex = STEPS.findIndex((s) => s.id === currentStep);
  const progress = ((stepIndex + 1) / STEPS.length) * 100;

  const goNext = () => {
    const nextIndex = stepIndex + 1;
    if (nextIndex < STEPS.length) {
      setCurrentStep(STEPS[nextIndex].id);
    }
  };

  const goPrev = () => {
    const prevIndex = stepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(STEPS[prevIndex].id);
    }
  };

  const generateScript = async () => {
    setIsGeneratingScript(true);
    try {
      const res = await fetch('/api/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ concept }),
      });
      
      if (res.ok) {
        const data = await res.json();
        setGeneratedScript(data.script.fullScript || JSON.stringify(data.script, null, 2));
      } else {
        setGeneratedScript('Failed to generate script. Please try again.');
      }
    } catch (error) {
      setGeneratedScript('Error generating script. Please try again.');
    }
    setIsGeneratingScript(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Sidebar */}
      <aside className="w-72 border-r border-white/10 bg-slate-900/50 flex flex-col">
        <div className="p-4 border-b border-white/10">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              EduReels
            </span>
          </Link>
        </div>

        {/* Progress */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-white/60">Progress</span>
            <span className="text-purple-400">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Steps */}
        <nav className="flex-1 overflow-auto p-2">
          {STEPS.map((step, index) => {
            const isActive = step.id === currentStep;
            const isCompleted = index < stepIndex;
            const Icon = step.icon;

            return (
              <button
                key={step.id}
                onClick={() => setCurrentStep(step.id)}
                className={`w-full text-left p-3 rounded-lg mb-1 transition-all flex items-center gap-3 ${
                  isActive
                    ? 'bg-purple-500/20 text-purple-300'
                    : isCompleted
                    ? 'text-white/80 hover:bg-white/5'
                    : 'text-white/40 hover:bg-white/5'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isActive
                      ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
                      : isCompleted
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-white/10'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>
                <span className="font-medium">{step.title}</span>
              </button>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="p-4 border-t border-white/10">
          <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2">
            <Download className="w-5 h-5" />
            Generate Reel
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="h-16 border-b border-white/10 px-6 flex items-center justify-between">
          <h1 className="text-lg font-semibold">Create New Reel</h1>
          <div className="flex items-center gap-2 text-sm text-white/60">
            <Clock className="w-4 h-4" />
            <span>{concept.duration}s • ~{estimateWordCount(concept.duration)} words</span>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto p-8">
          {/* Concept Step */}
          {currentStep === 'concept' && (
            <ConceptStep
              concept={concept}
              onChange={setConcept}
              generatedScript={generatedScript}
              isGenerating={isGeneratingScript}
              onGenerate={generateScript}
            />
          )}

          {/* Voice Step */}
          {currentStep === 'voice' && (
            <VoiceStep voiceId={voiceId} onChange={setVoiceId} />
          )}

          {/* Avatar Step */}
          {currentStep === 'avatar' && (
            <AvatarStep
              mode={avatarMode}
              position={avatarPosition}
              onModeChange={setAvatarMode}
              onPositionChange={setAvatarPosition}
            />
          )}

          {/* Style Step */}
          {currentStep === 'style' && (
            <StyleStep
              style={visualStyle}
              captionStyle={captionStyle}
              onStyleChange={setVisualStyle}
              onCaptionStyleChange={setCaptionStyle}
            />
          )}

          {/* Preview Step */}
          {currentStep === 'preview' && <PreviewStep />}
        </div>

        {/* Bottom Navigation */}
        <footer className="h-20 border-t border-white/10 px-8 flex items-center justify-between">
          <button
            onClick={goPrev}
            disabled={stepIndex === 0}
            className="flex items-center gap-2 text-white/60 hover:text-white disabled:text-white/20 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Previous
          </button>
          <button
            onClick={goNext}
            disabled={stepIndex === STEPS.length - 1}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-medium transition-all"
          >
            {stepIndex === STEPS.length - 1 ? 'Generate' : 'Next'}
            <ArrowRight className="w-5 h-5" />
          </button>
        </footer>
      </main>

      {/* Preview Panel */}
      <aside className="w-80 border-l border-white/10 bg-slate-900/50 flex flex-col">
        <div className="p-4 border-b border-white/10">
          <h2 className="font-semibold">Live Preview</h2>
        </div>
        <div className="flex-1 p-4 flex items-center justify-center">
          {/* Phone mockup */}
          <div className="w-full max-w-[200px] aspect-[9/16] bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-[2rem] border-2 border-white/10 flex items-center justify-center">
            <Play className="w-12 h-12 text-white/30" />
          </div>
        </div>
      </aside>
    </div>
  );
}

// Step Components
function ConceptStep({
  concept,
  onChange,
  generatedScript,
  isGenerating,
  onGenerate,
}: {
  concept: Concept;
  onChange: (c: Concept) => void;
  generatedScript: string | null;
  isGenerating: boolean;
  onGenerate: () => void;
}) {
  return (
    <div className="max-w-2xl animate-fade-in">
      <h2 className="text-2xl font-bold mb-2">What do you want to teach?</h2>
      <p className="text-white/60 mb-8">
        Enter your concept and AI will generate a viral-ready script.
      </p>

      <div className="space-y-6">
        {/* Topic */}
        <div>
          <label className="block text-sm font-medium mb-2">Topic / Concept</label>
          <input
            type="text"
            value={concept.topic}
            onChange={(e) => onChange({ ...concept, topic: e.target.value })}
            placeholder="e.g., Why compound interest is the 8th wonder of the world"
            className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-colors"
          />
        </div>

        {/* Duration */}
        <div>
          <label className="block text-sm font-medium mb-2">Duration</label>
          <div className="flex gap-3">
            {REEL_DURATIONS.map((d) => (
              <button
                key={d}
                onClick={() => onChange({ ...concept, duration: d })}
                className={`flex-1 py-3 rounded-xl border-2 font-medium transition-all ${
                  concept.duration === d
                    ? 'border-purple-500 bg-purple-500/20 text-purple-300'
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                {d}s
              </button>
            ))}
          </div>
        </div>

        {/* Tone */}
        <div>
          <label className="block text-sm font-medium mb-2">Tone</label>
          <div className="grid grid-cols-2 gap-3">
            {(['educational', 'casual', 'professional', 'entertaining'] as const).map((tone) => (
              <button
                key={tone}
                onClick={() => onChange({ ...concept, tone })}
                className={`py-3 rounded-xl border-2 font-medium capitalize transition-all ${
                  concept.tone === tone
                    ? 'border-purple-500 bg-purple-500/20 text-purple-300'
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                {tone}
              </button>
            ))}
          </div>
        </div>

        {/* Target Audience */}
        <div>
          <label className="block text-sm font-medium mb-2">Target Audience (optional)</label>
          <input
            type="text"
            value={concept.targetAudience || ''}
            onChange={(e) => onChange({ ...concept, targetAudience: e.target.value })}
            placeholder="e.g., Beginners interested in personal finance"
            className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-colors"
          />
        </div>

        {/* Generate Script Button */}
        <button
          onClick={onGenerate}
          disabled={!concept.topic || isGenerating}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 text-white py-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              Generating Script...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate Script with AI
            </>
          )}
        </button>

        {/* Generated Script Preview */}
        {generatedScript && (
          <div className="bg-slate-800/50 border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-purple-400">Generated Script</span>
              <button className="text-sm text-white/60 hover:text-white">Edit</button>
            </div>
            <p className="text-white/80 whitespace-pre-wrap">{generatedScript}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function VoiceStep({
  voiceId,
  onChange,
}: {
  voiceId: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="max-w-2xl animate-fade-in">
      <h2 className="text-2xl font-bold mb-2">Choose a Voice</h2>
      <p className="text-white/60 mb-8">Select the voice for your reel narration.</p>

      <div className="grid md:grid-cols-2 gap-4">
        {ELEVENLABS_VOICES.map((voice) => (
          <button
            key={voice.id}
            onClick={() => onChange(voice.id)}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              voiceId === voice.id
                ? 'border-purple-500 bg-purple-500/10'
                : 'border-white/10 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-lg">{voice.name}</span>
              <button
                onClick={(e) => e.stopPropagation()}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <Volume2 className="w-4 h-4 text-white/60" />
              </button>
            </div>
            <div className="flex items-center gap-2 text-sm text-white/60">
              <span className="capitalize">{voice.gender}</span>
              <span>•</span>
              <span className="capitalize">{voice.style}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function AvatarStep({
  mode,
  position,
  onModeChange,
  onPositionChange,
}: {
  mode: AvatarMode;
  position: string;
  onModeChange: (m: AvatarMode) => void;
  onPositionChange: (p: string) => void;
}) {
  return (
    <div className="max-w-2xl animate-fade-in">
      <h2 className="text-2xl font-bold mb-2">Avatar Settings</h2>
      <p className="text-white/60 mb-8">Choose between face or faceless style.</p>

      {/* Mode Selection */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <button
          onClick={() => onModeChange('faceless')}
          className={`p-6 rounded-xl border-2 text-center transition-all ${
            mode === 'faceless'
              ? 'border-purple-500 bg-purple-500/10'
              : 'border-white/10 hover:border-white/20'
          }`}
        >
          <div className="text-4xl mb-3">🎨</div>
          <div className="font-semibold mb-1">Faceless</div>
          <div className="text-sm text-white/60">Animated visuals + B-roll</div>
        </button>
        <button
          onClick={() => onModeChange('face')}
          className={`p-6 rounded-xl border-2 text-center transition-all ${
            mode === 'face'
              ? 'border-purple-500 bg-purple-500/10'
              : 'border-white/10 hover:border-white/20'
          }`}
        >
          <div className="text-4xl mb-3">👤</div>
          <div className="font-semibold mb-1">With Face</div>
          <div className="text-sm text-white/60">AI avatar or your own</div>
        </button>
      </div>

      {/* Position (for face mode) */}
      {mode === 'face' && (
        <div>
          <label className="block text-sm font-medium mb-3">Avatar Position</label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'corner_br', label: 'Corner BR', emoji: '↘️' },
              { id: 'corner_bl', label: 'Corner BL', emoji: '↙️' },
              { id: 'bottom_third', label: 'Bottom', emoji: '⬇️' },
              { id: 'corner_tr', label: 'Corner TR', emoji: '↗️' },
              { id: 'corner_tl', label: 'Corner TL', emoji: '↖️' },
              { id: 'full', label: 'Full', emoji: '🖼️' },
            ].map((pos) => (
              <button
                key={pos.id}
                onClick={() => onPositionChange(pos.id)}
                className={`p-3 rounded-xl border-2 text-center transition-all ${
                  position === pos.id
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                <div className="text-xl mb-1">{pos.emoji}</div>
                <div className="text-xs">{pos.label}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StyleStep({
  style,
  captionStyle,
  onStyleChange,
  onCaptionStyleChange,
}: {
  style: ReelStyle;
  captionStyle: CaptionStyle;
  onStyleChange: (s: ReelStyle) => void;
  onCaptionStyleChange: (c: CaptionStyle) => void;
}) {
  return (
    <div className="max-w-2xl animate-fade-in">
      <h2 className="text-2xl font-bold mb-2">Visual Style</h2>
      <p className="text-white/60 mb-8">Choose the look and feel of your reel.</p>

      {/* Style Presets */}
      <div className="mb-8">
        <label className="block text-sm font-medium mb-3">Style Preset</label>
        <div className="grid grid-cols-3 gap-3">
          {(Object.keys(STYLE_PRESETS) as ReelStyle[]).map((s) => {
            const preset = STYLE_PRESETS[s];
            return (
              <button
                key={s}
                onClick={() => onStyleChange(s)}
                className={`p-4 rounded-xl border-2 text-center transition-all ${
                  style === s
                    ? 'border-purple-500'
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                <div
                  className="w-full h-12 rounded-lg mb-2"
                  style={{
                    background: `linear-gradient(135deg, ${preset.primaryColor}, ${preset.secondaryColor})`,
                  }}
                />
                <div className="text-sm capitalize">{s.replace('_', ' ')}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Caption Style */}
      <div>
        <label className="block text-sm font-medium mb-3">Caption Style</label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { id: 'tiktok_bounce', label: 'TikTok Bounce', emoji: '⬆️' },
            { id: 'highlight_word', label: 'Highlight', emoji: '🟡' },
            { id: 'karaoke', label: 'Karaoke', emoji: '🎤' },
            { id: 'subtitle_classic', label: 'Classic', emoji: '📝' },
          ].map((cap) => (
            <button
              key={cap.id}
              onClick={() => onCaptionStyleChange(cap.id as CaptionStyle)}
              className={`p-4 rounded-xl border-2 text-center transition-all ${
                captionStyle === cap.id
                  ? 'border-purple-500 bg-purple-500/10'
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              <div className="text-2xl mb-1">{cap.emoji}</div>
              <div className="text-sm">{cap.label}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function PreviewStep() {
  return (
    <div className="max-w-2xl animate-fade-in">
      <h2 className="text-2xl font-bold mb-2">Preview & Generate</h2>
      <p className="text-white/60 mb-8">Review your settings and generate your reel.</p>

      <div className="bg-slate-800/50 border border-white/10 rounded-xl p-6 mb-6">
        <h3 className="font-semibold mb-4">Summary</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-white/60">Duration</span>
            <span>60 seconds</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">Voice</span>
            <span>Sarah (Energetic)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">Avatar</span>
            <span>Faceless</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">Style</span>
            <span>Modern Minimal</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">Captions</span>
            <span>TikTok Bounce</span>
          </div>
        </div>
      </div>

      <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 text-center">
        <Check className="w-12 h-12 text-green-400 mx-auto mb-3" />
        <h3 className="font-semibold text-green-400 mb-1">Ready to Generate!</h3>
        <p className="text-sm text-white/60">Click the button below to create your reel.</p>
      </div>
    </div>
  );
}
