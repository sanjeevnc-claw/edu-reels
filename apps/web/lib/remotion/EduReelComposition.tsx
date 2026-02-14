import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  staticFile,
} from 'remotion';

export interface WordTimestamp {
  word: string;
  start: number;
  end: number;
}

export interface EduReelProps {
  audioUrl: string;
  wordTimestamps: WordTimestamp[];
  duration: number;
  captionStyle: 'tiktok_bounce' | 'highlight_word' | 'subtitle_classic';
  primaryColor: string;
  accentColor: string;
}

export const EduReelComposition: React.FC<EduReelProps> = ({
  audioUrl,
  wordTimestamps,
  duration,
  captionStyle,
  primaryColor,
  accentColor,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Fade in/out
  const fadeIn = interpolate(frame, [0, fps / 2], [0, 1], { extrapolateRight: 'clamp' });
  const totalFrames = duration * fps;
  const fadeOut = interpolate(frame, [totalFrames - fps / 2, totalFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const opacity = fadeIn * fadeOut;

  return (
    <AbsoluteFill
      style={{
        opacity,
        backgroundColor: primaryColor,
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {/* Animated background */}
      <AnimatedBackground primaryColor={primaryColor} />

      {/* Audio */}
      {audioUrl && <Audio src={audioUrl} />}

      {/* Captions */}
      <Captions
        wordTimestamps={wordTimestamps}
        style={captionStyle}
        accentColor={accentColor}
        fps={fps}
        width={width}
        height={height}
      />
    </AbsoluteFill>
  );
};

// Animated background component
const AnimatedBackground: React.FC<{ primaryColor: string }> = ({ primaryColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Subtle gradient animation
  const gradientPosition = interpolate(frame, [0, fps * 10], [0, 100], {
    extrapolateRight: 'extend',
  });

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(${gradientPosition}deg, ${primaryColor}, #1a1a2e, ${primaryColor})`,
      }}
    />
  );
};

// Captions component
const Captions: React.FC<{
  wordTimestamps: WordTimestamp[];
  style: string;
  accentColor: string;
  fps: number;
  width: number;
  height: number;
}> = ({ wordTimestamps, style, accentColor, fps, width, height }) => {
  const frame = useCurrentFrame();
  const currentTime = frame / fps;

  // Find current word and group
  const wordsPerGroup = 3;
  const currentWordIndex = wordTimestamps.findIndex(
    (w, i) =>
      currentTime >= w.start &&
      (i === wordTimestamps.length - 1 || currentTime < wordTimestamps[i + 1]?.start)
  );

  if (currentWordIndex === -1) return null;

  const groupStart = Math.floor(currentWordIndex / wordsPerGroup) * wordsPerGroup;
  const visibleWords = wordTimestamps.slice(groupStart, groupStart + wordsPerGroup);

  if (visibleWords.length === 0) return null;

  if (style === 'tiktok_bounce') {
    return (
      <TikTokCaptions
        words={visibleWords}
        currentWordIndex={currentWordIndex}
        groupStart={groupStart}
        accentColor={accentColor}
        fps={fps}
        height={height}
      />
    );
  }

  if (style === 'highlight_word') {
    return (
      <HighlightCaptions
        words={visibleWords}
        currentWordIndex={currentWordIndex}
        groupStart={groupStart}
        accentColor={accentColor}
        width={width}
        height={height}
      />
    );
  }

  // Default: subtitle_classic
  return (
    <ClassicCaptions
      words={visibleWords}
      width={width}
      height={height}
    />
  );
};

// TikTok-style bouncing captions
const TikTokCaptions: React.FC<{
  words: WordTimestamp[];
  currentWordIndex: number;
  groupStart: number;
  accentColor: string;
  fps: number;
  height: number;
}> = ({ words, currentWordIndex, groupStart, accentColor, fps, height }) => {
  const frame = useCurrentFrame();

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: height * 0.25,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
        padding: '0 40px',
      }}
    >
      {words.map((word, i) => {
        const absoluteIndex = groupStart + i;
        const isCurrentWord = absoluteIndex === currentWordIndex;
        const wordFrame = Math.floor(word.start * fps);

        // Bounce animation
        const bounce = isCurrentWord
          ? spring({
              frame: frame - wordFrame,
              fps,
              config: { damping: 10, mass: 0.5, stiffness: 200 },
            })
          : 1;

        const scale = interpolate(bounce, [0, 1], [0.8, 1]);
        const translateY = interpolate(bounce, [0, 0.5, 1], [20, -10, 0]);

        return (
          <span
            key={`${word.word}-${absoluteIndex}`}
            style={{
              fontSize: 72,
              fontWeight: 900,
              color: isCurrentWord ? accentColor : '#FFFFFF',
              textShadow: '0 4px 20px rgba(0,0,0,0.5)',
              transform: `scale(${scale}) translateY(${translateY}px)`,
              textTransform: 'uppercase',
            }}
          >
            {word.word}
          </span>
        );
      })}
    </div>
  );
};

// Highlight word captions
const HighlightCaptions: React.FC<{
  words: WordTimestamp[];
  currentWordIndex: number;
  groupStart: number;
  accentColor: string;
  width: number;
  height: number;
}> = ({ words, currentWordIndex, groupStart, accentColor, width, height }) => {
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: height * 0.25,
        display: 'flex',
        justifyContent: 'center',
        padding: '0 40px',
      }}
    >
      <div
        style={{
          backgroundColor: 'rgba(0,0,0,0.8)',
          borderRadius: 16,
          padding: '16px 32px',
          display: 'flex',
          gap: 12,
          flexWrap: 'wrap',
          justifyContent: 'center',
          maxWidth: width - 80,
        }}
      >
        {words.map((word, i) => {
          const absoluteIndex = groupStart + i;
          const isCurrentWord = absoluteIndex === currentWordIndex;

          return (
            <span
              key={`${word.word}-${absoluteIndex}`}
              style={{
                fontSize: 48,
                fontWeight: 700,
                color: '#FFFFFF',
                backgroundColor: isCurrentWord ? accentColor : 'transparent',
                padding: isCurrentWord ? '4px 12px' : '4px 0',
                borderRadius: 8,
              }}
            >
              {word.word}
            </span>
          );
        })}
      </div>
    </div>
  );
};

// Classic subtitle captions
const ClassicCaptions: React.FC<{
  words: WordTimestamp[];
  width: number;
  height: number;
}> = ({ words, width, height }) => {
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: height * 0.15,
        display: 'flex',
        justifyContent: 'center',
        padding: '0 40px',
      }}
    >
      <div
        style={{
          backgroundColor: 'rgba(0,0,0,0.8)',
          borderRadius: 8,
          padding: '12px 24px',
          maxWidth: width - 80,
        }}
      >
        <span
          style={{
            fontSize: 40,
            fontWeight: 500,
            color: '#FFFFFF',
          }}
        >
          {words.map((w) => w.word).join(' ')}
        </span>
      </div>
    </div>
  );
};
