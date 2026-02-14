import React from 'react';
import {
  AbsoluteFill,
  Audio,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Sequence,
} from 'remotion';

export interface SimpleReelProps {
  audioUrl: string;
  wordTimestamps: Array<{ word: string; start: number; end: number }>;
  duration: number;
  captionStyle: 'tiktok_bounce' | 'highlight_word' | 'subtitle_classic';
  primaryColor: string;
  accentColor: string;
  secondaryColor?: string;
}

export const SimpleReel: React.FC<SimpleReelProps> = ({
  audioUrl,
  wordTimestamps,
  duration,
  captionStyle,
  primaryColor,
  accentColor,
  secondaryColor,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const totalFrames = duration * fps;

  // Fade in/out
  const fadeIn = interpolate(frame, [0, fps / 2], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [totalFrames - fps / 2, totalFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const opacity = fadeIn * fadeOut;

  return (
    <AbsoluteFill style={{ opacity }}>
      {/* Animated Background */}
      <AnimatedBackground
        primaryColor={primaryColor}
        secondaryColor={secondaryColor || adjustColor(primaryColor, 30)}
        accentColor={accentColor}
        fps={fps}
        width={width}
        height={height}
      />

      {/* Audio */}
      {audioUrl && <Audio src={audioUrl} />}

      {/* Captions */}
      {wordTimestamps && wordTimestamps.length > 0 && (
        <Captions
          wordTimestamps={wordTimestamps}
          style={captionStyle}
          accentColor={accentColor}
          fps={fps}
          width={width}
          height={height}
        />
      )}
    </AbsoluteFill>
  );
};

// Animated Background Component
const AnimatedBackground: React.FC<{
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fps: number;
  width: number;
  height: number;
}> = ({ primaryColor, secondaryColor, accentColor, fps, width, height }) => {
  const frame = useCurrentFrame();
  const progress = (frame / fps) * 0.3;
  const rotation = (progress * 360) % 360;

  // Floating orbs for depth
  const orb1Y = interpolate(Math.sin(frame / 30), [-1, 1], [height * 0.1, height * 0.3]);
  const orb2Y = interpolate(Math.sin(frame / 25 + 1), [-1, 1], [height * 0.4, height * 0.6]);
  const orb3Y = interpolate(Math.sin(frame / 35 + 2), [-1, 1], [height * 0.6, height * 0.8]);

  return (
    <AbsoluteFill>
      {/* Base gradient */}
      <div
        style={{
          width: '100%',
          height: '100%',
          background: `linear-gradient(${rotation}deg, ${primaryColor} 0%, ${secondaryColor} 50%, ${primaryColor} 100%)`,
        }}
      />

      {/* Floating orbs */}
      <div
        style={{
          position: 'absolute',
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${accentColor}30 0%, transparent 70%)`,
          left: width * 0.05,
          top: orb1Y,
          filter: 'blur(80px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${secondaryColor}40 0%, transparent 70%)`,
          right: width * 0.1,
          top: orb2Y,
          filter: 'blur(60px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 350,
          height: 350,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${accentColor}25 0%, transparent 70%)`,
          left: width * 0.35,
          top: orb3Y,
          filter: 'blur(50px)',
        }}
      />
    </AbsoluteFill>
  );
};

// Captions Component
const Captions: React.FC<{
  wordTimestamps: Array<{ word: string; start: number; end: number }>;
  style: 'tiktok_bounce' | 'highlight_word' | 'subtitle_classic';
  accentColor: string;
  fps: number;
  width: number;
  height: number;
}> = ({ wordTimestamps, style, accentColor, fps, width, height }) => {
  const frame = useCurrentFrame();
  const currentTime = frame / fps;

  // Find current word index
  const currentWordIndex = wordTimestamps.findIndex(
    (w, i) =>
      currentTime >= w.start &&
      (i === wordTimestamps.length - 1 || currentTime < wordTimestamps[i + 1].start)
  );

  // Group words (3 at a time for TikTok style)
  const wordsPerGroup = style === 'subtitle_classic' ? 6 : 3;
  const groupStart = Math.max(0, Math.floor(currentWordIndex / wordsPerGroup) * wordsPerGroup);
  const visibleWords = wordTimestamps.slice(groupStart, groupStart + wordsPerGroup);

  if (visibleWords.length === 0) return null;

  const positionStyle: React.CSSProperties = {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: height * 0.2,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '0 40px',
  };

  if (style === 'tiktok_bounce') {
    return (
      <div style={positionStyle}>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
          {visibleWords.map((word, i) => {
            const absoluteIndex = groupStart + i;
            const isCurrentWord = absoluteIndex === currentWordIndex;
            const wordFrame = Math.floor(word.start * fps);

            const bounce = isCurrentWord
              ? spring({
                  frame: frame - wordFrame,
                  fps,
                  config: { damping: 10, mass: 0.5, stiffness: 200 },
                })
              : 1;

            const scale = interpolate(bounce, [0, 1], [0.7, 1]);
            const translateY = interpolate(bounce, [0, 0.5, 1], [30, -15, 0]);

            return (
              <span
                key={`${word.word}-${absoluteIndex}`}
                style={{
                  fontFamily: 'Inter, system-ui, sans-serif',
                  fontSize: 72,
                  fontWeight: 900,
                  color: isCurrentWord ? accentColor : '#FFFFFF',
                  textShadow: '0 4px 30px rgba(0,0,0,0.6), 0 2px 10px rgba(0,0,0,0.4)',
                  transform: `scale(${scale}) translateY(${translateY}px)`,
                  textTransform: 'uppercase',
                  letterSpacing: '-0.02em',
                }}
              >
                {word.word}
              </span>
            );
          })}
        </div>
      </div>
    );
  }

  if (style === 'highlight_word') {
    return (
      <div style={positionStyle}>
        <div
          style={{
            backgroundColor: 'rgba(0,0,0,0.85)',
            borderRadius: 16,
            padding: '20px 36px',
            display: 'flex',
            gap: 14,
            flexWrap: 'wrap',
            justifyContent: 'center',
            maxWidth: width - 80,
          }}
        >
          {visibleWords.map((word, i) => {
            const absoluteIndex = groupStart + i;
            const isCurrentWord = absoluteIndex === currentWordIndex;

            return (
              <span
                key={`${word.word}-${absoluteIndex}`}
                style={{
                  fontFamily: 'Inter, system-ui, sans-serif',
                  fontSize: 52,
                  fontWeight: 700,
                  color: '#FFFFFF',
                  backgroundColor: isCurrentWord ? accentColor : 'transparent',
                  padding: isCurrentWord ? '6px 16px' : '6px 4px',
                  borderRadius: 10,
                  transition: 'background-color 0.1s',
                }}
              >
                {word.word}
              </span>
            );
          })}
        </div>
      </div>
    );
  }

  // subtitle_classic
  return (
    <div style={positionStyle}>
      <div
        style={{
          backgroundColor: 'rgba(0,0,0,0.85)',
          borderRadius: 12,
          padding: '16px 32px',
          maxWidth: width - 100,
        }}
      >
        <span
          style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: 44,
            fontWeight: 500,
            color: '#FFFFFF',
            lineHeight: 1.4,
          }}
        >
          {visibleWords.map((w) => w.word).join(' ')}
        </span>
      </div>
    </div>
  );
};

// Helper to adjust color brightness
function adjustColor(color: string, percent: number): string {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = ((num >> 8) & 0x00ff) + amt;
  const B = (num & 0x0000ff) + amt;
  return (
    '#' +
    (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)
  );
}
