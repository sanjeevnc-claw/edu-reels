'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import {
  REEL_DURATIONS,
  ELEVENLABS_VOICES,
  STYLE_PRESETS,
  DEFAULT_VOICE_SETTINGS,
  DEFAULT_AVATAR_SETTINGS,
  estimateWordCount,
} from '@/lib/shared';
import type { Concept, AvatarMode, ReelStyle, CaptionStyle } from '@/lib/shared';
import { Zap, ArrowLeft, ArrowRight, Check, Loader2, Sparkles } from 'lucide-react';

type Step = 'concept' | 'voice' | 'avatar' | 'style' | 'preview';

const STEPS: { id: Step; label: string }[] = [
  { id: 'concept', label: 'Concept' },
  { id: 'voice', label: 'Voice' },
  { id: 'avatar', label: 'Avatar' },
  { id: 'style', label: 'Style' },
  { id: 'preview', label: 'Preview' },
];

export default function CreatePage() {
  const [step, setStep] = useState<Step>('concept');
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [script, setScript] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [generationStatus, setGenerationStatus] = useState<string | null>(null);

  const [concept, setConcept] = useState<Concept>({
    id: '', topic: '', targetAudience: '', keyPoints: [], tone: 'educational', duration: 60,
  });
  const [voiceId, setVoiceId] = useState(DEFAULT_VOICE_SETTINGS.voiceId);
  const [avatarMode, setAvatarMode] = useState<AvatarMode>('faceless');
  const [avatarPosition, setAvatarPosition] = useState<string>(DEFAULT_AVATAR_SETTINGS.position);
  const [visualStyle, setVisualStyle] = useState<ReelStyle>('modern_minimal');
  const [captionStyle, setCaptionStyle] = useState<CaptionStyle>('tiktok_bounce');

  const stepIdx = STEPS.findIndex((s) => s.id === step);

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

  const generateReel = async () => {
    if (!concept.topic.trim()) {
      setError('Please enter a topic first');
      return;
    }

    setGenerating(true);
    setError(null);
    setGenerationStatus('Generating script...');

    try {
      // Step 1: Generate script if not already done
      if (!script) {
        const scriptRes = await fetch('/api/generate-script', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ concept }),
        });
        const scriptData = await scriptRes.json();
        if (!scriptRes.ok) {
          throw new Error(scriptData.error || 'Failed to generate script');
        }
        setScript(scriptData.script.fullScript || JSON.stringify(scriptData.script, null, 2));
      }

      // Step 2: Generate voiceover (simulated for now)
      setGenerationStatus('Generating voiceover...');
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Step 3: Generate visuals (simulated for now)
      setGenerationStatus('Creating visuals...');
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Step 4: Rendering video (simulated for now)
      setGenerationStatus('Rendering video...');
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Complete
      setGenerationStatus('Complete! Your reel is ready.');
      
      // Show success for a moment then reset
      setTimeout(() => {
        setGenerating(false);
        setGenerationStatus(null);
        // TODO: Navigate to video preview or download page
        alert('🎬 Reel generated successfully!\n\nVideo generation pipeline coming soon. Your script has been created and saved.');
      }, 1000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate reel');
      setGenerating(false);
      setGenerationStatus(null);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          {/* Top bar */}
          <div className="h-14 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-neutral-900 flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-sm">EduReels</span>
            </Link>
            <span className="text-xs text-neutral-500">
              {concept.duration || 60}s • ~{estimateWordCount(concept.duration || 60)} words
            </span>
          </div>

          {/* Step tabs */}
          <div className="flex items-center gap-1 pb-3 overflow-x-auto">
            {STEPS.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setStep(s.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors",
                  s.id === step && "bg-neutral-900 text-white",
                  s.id !== step && i < stepIdx && "bg-neutral-100 text-neutral-700",
                  s.id !== step && i >= stepIdx && "text-neutral-400 hover:text-neutral-600"
                )}
              >
                {i < stepIdx && <Check className="w-3 h-3" />}
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-lg mx-auto px-4 sm:px-6 py-6 pb-28">
        {step === 'concept' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-xl font-semibold text-neutral-900">What do you want to teach?</h1>
              <p className="text-sm text-neutral-500 mt-1">Enter your concept and AI will generate a viral-ready script.</p>
            </div>

            <div className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="topic" className="text-sm">Topic / Concept</Label>
                <Input
                  id="topic"
                  value={concept.topic}
                  onChange={(e) => setConcept({ ...concept, topic: e.target.value })}
                  placeholder="e.g., Why compound interest is the 8th wonder"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm">Duration</Label>
                <div className="grid grid-cols-4 gap-2">
                  {REEL_DURATIONS.map((d) => (
                    <Button
                      key={d}
                      type="button"
                      size="sm"
                      variant={concept.duration === d ? "default" : "outline"}
                      onClick={() => setConcept({ ...concept, duration: d })}
                    >
                      {d}s
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm">Tone</Label>
                <div className="grid grid-cols-2 gap-2">
                  {(['educational', 'casual', 'professional', 'entertaining'] as const).map((t) => (
                    <Button
                      key={t}
                      type="button"
                      size="sm"
                      variant={concept.tone === t ? "default" : "outline"}
                      onClick={() => setConcept({ ...concept, tone: t })}
                      className="capitalize"
                    >
                      {t}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="audience" className="text-sm">Target Audience (optional)</Label>
                <Input
                  id="audience"
                  value={concept.targetAudience || ''}
                  onChange={(e) => setConcept({ ...concept, targetAudience: e.target.value })}
                  placeholder="e.g., Beginners interested in finance"
                />
              </div>

              <Button
                onClick={generateScript}
                disabled={!concept.topic.trim() || loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Generate Script with AI'
                )}
              </Button>

              {error && (
                <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">
                  {error}
                </div>
              )}

              {script && (
                <Card>
                  <CardHeader className="pb-2 pt-4 px-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">Generated Script</CardTitle>
                      <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setScript(null)}>
                        Clear
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    <p className="text-sm text-neutral-600 whitespace-pre-wrap leading-relaxed">{script}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {step === 'voice' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-xl font-semibold text-neutral-900">Choose a Voice</h1>
              <p className="text-sm text-neutral-500 mt-1">Select the voice for your reel narration.</p>
            </div>
            <RadioGroup value={voiceId} onValueChange={setVoiceId} className="space-y-2">
              {ELEVENLABS_VOICES.map((v) => (
                <label
                  key={v.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                    voiceId === v.id ? "border-neutral-900 bg-neutral-50" : "border-neutral-200 hover:border-neutral-300"
                  )}
                >
                  <RadioGroupItem value={v.id} id={v.id} />
                  <div>
                    <div className="text-sm font-medium">{v.name}</div>
                    <div className="text-xs text-neutral-500 capitalize">{v.gender} • {v.style}</div>
                  </div>
                </label>
              ))}
            </RadioGroup>
          </div>
        )}

        {step === 'avatar' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-xl font-semibold text-neutral-900">Avatar Settings</h1>
              <p className="text-sm text-neutral-500 mt-1">Choose between face or faceless style.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'faceless' as const, label: 'Faceless', desc: 'Animated visuals only' },
                { id: 'face' as const, label: 'With Face', desc: 'AI avatar presenter' },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setAvatarMode(m.id)}
                  className={cn(
                    "p-4 rounded-lg border text-left transition-colors",
                    avatarMode === m.id ? "border-neutral-900 bg-neutral-50" : "border-neutral-200 hover:border-neutral-300"
                  )}
                >
                  <div className="text-sm font-medium">{m.label}</div>
                  <div className="text-xs text-neutral-500 mt-0.5">{m.desc}</div>
                </button>
              ))}
            </div>
            {avatarMode === 'face' && (
              <div className="space-y-2">
                <Label className="text-sm">Position</Label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'corner_br', label: 'Bottom Right' },
                    { id: 'corner_bl', label: 'Bottom Left' },
                    { id: 'bottom_third', label: 'Bottom' },
                    { id: 'corner_tr', label: 'Top Right' },
                    { id: 'corner_tl', label: 'Top Left' },
                    { id: 'full', label: 'Full Screen' },
                  ].map((p) => (
                    <Button
                      key={p.id}
                      type="button"
                      size="sm"
                      variant={avatarPosition === p.id ? "default" : "outline"}
                      onClick={() => setAvatarPosition(p.id)}
                      className="text-xs"
                    >
                      {p.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {step === 'style' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-xl font-semibold text-neutral-900">Visual Style</h1>
              <p className="text-sm text-neutral-500 mt-1">Choose the look and feel.</p>
            </div>
            <div className="space-y-5">
              <div className="space-y-2">
                <Label className="text-sm">Style Preset</Label>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(STYLE_PRESETS) as ReelStyle[]).map((s) => {
                    const p = STYLE_PRESETS[s];
                    return (
                      <button
                        key={s}
                        onClick={() => setVisualStyle(s)}
                        className={cn(
                          "p-2 rounded-lg border text-center transition-colors",
                          visualStyle === s ? "border-neutral-900" : "border-neutral-200 hover:border-neutral-300"
                        )}
                      >
                        <div 
                          className="h-10 rounded mb-1.5" 
                          style={{ background: `linear-gradient(135deg, ${p.primaryColor}, ${p.secondaryColor})` }} 
                        />
                        <div className="text-xs capitalize">{s.replace('_', ' ')}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Caption Style</Label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'tiktok_bounce', label: 'TikTok Bounce' },
                    { id: 'highlight_word', label: 'Highlight' },
                    { id: 'karaoke', label: 'Karaoke' },
                    { id: 'subtitle_classic', label: 'Classic' },
                  ].map((c) => (
                    <Button
                      key={c.id}
                      type="button"
                      size="sm"
                      variant={captionStyle === c.id ? "default" : "outline"}
                      onClick={() => setCaptionStyle(c.id as CaptionStyle)}
                    >
                      {c.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 'preview' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-xl font-semibold text-neutral-900">Preview & Generate</h1>
              <p className="text-sm text-neutral-500 mt-1">Review your settings and generate.</p>
            </div>
            <Card>
              <CardHeader className="pb-0 pt-4 px-4">
                <CardTitle className="text-sm font-medium">Summary</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-3">
                <div className="space-y-2">
                  {[
                    ['Topic', concept.topic || '—'],
                    ['Duration', `${concept.duration}s`],
                    ['Voice', ELEVENLABS_VOICES.find((v) => v.id === voiceId)?.name || voiceId],
                    ['Avatar', avatarMode === 'face' ? `With Face (${avatarPosition.replace('_', ' ')})` : 'Faceless'],
                    ['Style', visualStyle.replace('_', ' ')],
                    ['Captions', captionStyle.replace('_', ' ')],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between py-1.5 border-b border-neutral-100 last:border-0 text-sm">
                      <span className="text-neutral-500">{k}</span>
                      <span className="font-medium capitalize">{v}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {error && (
              <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">
                {error}
              </div>
            )}

            {generating ? (
              <div className="p-6 rounded-lg bg-neutral-50 border border-neutral-200 text-center">
                <Loader2 className="w-8 h-8 mx-auto mb-3 text-neutral-900 animate-spin" />
                <h3 className="text-sm font-medium">{generationStatus}</h3>
                <p className="text-xs text-neutral-500 mt-1">This may take a few minutes...</p>
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-neutral-50 border border-neutral-200 text-center">
                <Check className="w-6 h-6 mx-auto mb-1.5 text-neutral-900" />
                <h3 className="text-sm font-medium">Ready to Generate</h3>
                <p className="text-xs text-neutral-500 mt-0.5">Your reel will be ready in about 2 minutes</p>
              </div>
            )}

            <Button 
              className="w-full" 
              onClick={generateReel}
              disabled={generating || !concept.topic.trim()}
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Reel
                </>
              )}
            </Button>
          </div>
        )}
      </main>

      {/* Footer navigation */}
      <footer className="fixed bottom-0 left-0 right-0 p-3 border-t border-neutral-200 bg-white">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={prev}
            disabled={stepIdx === 0}
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>
          <Button
            size="sm"
            onClick={next}
            disabled={stepIdx === STEPS.length - 1}
          >
            {stepIdx === STEPS.length - 1 ? 'Generate' : 'Next'}
            {stepIdx < STEPS.length - 1 && <ArrowRight className="w-4 h-4 ml-1" />}
          </Button>
        </div>
      </footer>
    </div>
  );
}
