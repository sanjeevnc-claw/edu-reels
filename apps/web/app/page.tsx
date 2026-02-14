'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs';
import { ArrowRight, Zap, Mic, Film } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-neutral-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-neutral-900 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-sm">EduReels</span>
          </div>
          <div className="flex items-center gap-3">
            <SignedOut>
              <SignInButton mode="modal">
                <Button variant="ghost" size="sm">Sign In</Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button size="sm">Get Started</Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Button size="sm" asChild>
                <Link href="/create">Create Reel</Link>
              </Button>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="max-w-xl">
          <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-3">
            AI-Powered Educational Content
          </p>
          
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 mb-4">
            Turn Ideas into Viral Reels
          </h1>
          
          <p className="text-base text-neutral-600 mb-8 leading-relaxed">
            Create engaging educational short-form videos in minutes. 
            AI generates scripts, adds voiceovers, and produces TikTok-ready content.
          </p>

          <div className="flex flex-col sm:flex-row gap-2">
            <SignedOut>
              <SignUpButton mode="modal">
                <Button className="gap-2">
                  Start Creating
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Button asChild>
                <Link href="/create" className="gap-2">
                  Start Creating
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </SignedIn>
          </div>
        </div>

        {/* Features */}
        <div className="grid sm:grid-cols-3 gap-4 mt-16">
          {[
            {
              icon: <Zap className="w-4 h-4" />,
              title: 'AI Script Generation',
              desc: 'Enter a topic, get a viral-ready script with hooks, key points, and CTAs.',
            },
            {
              icon: <Mic className="w-4 h-4" />,
              title: 'Natural Voiceovers',
              desc: 'Choose from multiple AI voices or use your own. ElevenLabs quality.',
            },
            {
              icon: <Film className="w-4 h-4" />,
              title: 'Auto Visual Styling',
              desc: 'TikTok-style captions, B-roll, and animations generated automatically.',
            },
          ].map((f) => (
            <Card key={f.title} className="border-neutral-200">
              <CardContent className="pt-5 pb-5">
                <div className="w-8 h-8 rounded bg-neutral-100 flex items-center justify-center mb-3">
                  {f.icon}
                </div>
                <h3 className="text-sm font-medium mb-1">{f.title}</h3>
                <p className="text-xs text-neutral-500 leading-relaxed">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200 py-6">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center text-neutral-400 text-xs">
          Built with AI • Powered by OpenAI, ElevenLabs, and Remotion
        </div>
      </footer>
    </div>
  );
}
