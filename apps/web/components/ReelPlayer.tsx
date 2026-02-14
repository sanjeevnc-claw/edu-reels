'use client';

import React, { useMemo } from 'react';
import { Player } from '@remotion/player';
import { EduReelComposition, type EduReelProps } from '@/lib/remotion/EduReelComposition';

const VIDEO_FPS = 30;
const VIDEO_WIDTH = 1080;
const VIDEO_HEIGHT = 1920;

interface ReelPlayerProps {
  audioUrl?: string;
  wordTimestamps?: Array<{ word: string; start: number; end: number }>;
  duration: number;
  captionStyle: 'tiktok_bounce' | 'highlight_word' | 'subtitle_classic';
  primaryColor: string;
  accentColor: string;
  className?: string;
  autoPlay?: boolean;
}

export const ReelPlayer: React.FC<ReelPlayerProps> = ({
  audioUrl = '',
  wordTimestamps = [],
  duration,
  captionStyle,
  primaryColor,
  accentColor,
  className = '',
  autoPlay = false,
}) => {
  const inputProps = useMemo(
    () => ({
      audioUrl,
      wordTimestamps,
      duration,
      captionStyle,
      primaryColor,
      accentColor,
    }),
    [audioUrl, wordTimestamps, duration, captionStyle, primaryColor, accentColor]
  );

  return (
    <div className={`relative overflow-hidden rounded-lg ${className}`}>
      <Player
        component={EduReelComposition as unknown as React.ComponentType<Record<string, unknown>>}
        inputProps={inputProps as unknown as Record<string, unknown>}
        durationInFrames={Math.ceil(duration * VIDEO_FPS)}
        fps={VIDEO_FPS}
        compositionWidth={VIDEO_WIDTH}
        compositionHeight={VIDEO_HEIGHT}
        style={{
          width: '100%',
          aspectRatio: '9/16',
          maxHeight: '500px',
        }}
        controls
        autoPlay={autoPlay}
        loop
      />
    </div>
  );
};
