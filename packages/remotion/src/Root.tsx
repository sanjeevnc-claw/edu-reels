import { Composition, Folder } from 'remotion';
import { EduReel } from './compositions/EduReel';
import { SimpleReel, type SimpleReelProps } from './compositions/SimpleReel';
import {
  VIDEO_FPS,
  VIDEO_WIDTH,
  VIDEO_HEIGHT,
  DEFAULT_VOICE_SETTINGS,
  DEFAULT_AVATAR_SETTINGS,
  DEFAULT_VISUAL_SETTINGS,
} from '@edu-reels/shared';

export const Root: React.FC = () => {
  const defaultReel = {
    id: 'preview',
    userId: 'preview',
    concept: {
      id: 'preview-concept',
      topic: 'Sample Educational Reel',
      duration: 60,
    },
    voiceSettings: DEFAULT_VOICE_SETTINGS,
    avatarSettings: DEFAULT_AVATAR_SETTINGS,
    visualSettings: DEFAULT_VISUAL_SETTINGS,
    bRolls: [],
    status: 'draft' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const defaultSimpleProps: SimpleReelProps = {
    audioUrl: '',
    wordTimestamps: [],
    duration: 60,
    captionStyle: 'tiktok_bounce',
    primaryColor: '#0f0f23',
    accentColor: '#00ff88',
  };

  return (
    <>
      {/* SimpleReel - Primary composition for rendering */}
      <Composition
        id="SimpleReel"
        component={SimpleReel}
        durationInFrames={VIDEO_FPS * 60}
        fps={VIDEO_FPS}
        width={VIDEO_WIDTH}
        height={VIDEO_HEIGHT}
        defaultProps={defaultSimpleProps}
        calculateMetadata={async ({ props }) => ({
          durationInFrames: Math.ceil((props.duration || 60) * VIDEO_FPS),
        })}
      />

      {/* Main EduReel Composition (full-featured) */}
      <Composition
        id="EduReel"
        component={EduReel}
        durationInFrames={VIDEO_FPS * 60} // Default 60 seconds
        fps={VIDEO_FPS}
        width={VIDEO_WIDTH}
        height={VIDEO_HEIGHT}
        defaultProps={{
          reel: defaultReel,
          fps: VIDEO_FPS,
          width: VIDEO_WIDTH,
          height: VIDEO_HEIGHT,
        }}
      />

      {/* Preview Compositions */}
      <Folder name="Previews">
        {/* 15 second reel */}
        <Composition
          id="EduReel-15s"
          component={EduReel}
          durationInFrames={VIDEO_FPS * 15}
          fps={VIDEO_FPS}
          width={VIDEO_WIDTH}
          height={VIDEO_HEIGHT}
          defaultProps={{
            reel: { ...defaultReel, concept: { ...defaultReel.concept, duration: 15 } },
            fps: VIDEO_FPS,
            width: VIDEO_WIDTH,
            height: VIDEO_HEIGHT,
          }}
        />

        {/* 30 second reel */}
        <Composition
          id="EduReel-30s"
          component={EduReel}
          durationInFrames={VIDEO_FPS * 30}
          fps={VIDEO_FPS}
          width={VIDEO_WIDTH}
          height={VIDEO_HEIGHT}
          defaultProps={{
            reel: { ...defaultReel, concept: { ...defaultReel.concept, duration: 30 } },
            fps: VIDEO_FPS,
            width: VIDEO_WIDTH,
            height: VIDEO_HEIGHT,
          }}
        />

        {/* 90 second reel */}
        <Composition
          id="EduReel-90s"
          component={EduReel}
          durationInFrames={VIDEO_FPS * 90}
          fps={VIDEO_FPS}
          width={VIDEO_WIDTH}
          height={VIDEO_HEIGHT}
          defaultProps={{
            reel: { ...defaultReel, concept: { ...defaultReel.concept, duration: 90 } },
            fps: VIDEO_FPS,
            width: VIDEO_WIDTH,
            height: VIDEO_HEIGHT,
          }}
        />
      </Folder>
    </>
  );
};
