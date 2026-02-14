import { Composition, registerRoot } from 'remotion';
import { EduReelComposition, EduReelProps } from './EduReelComposition';

// Default props for studio preview
const defaultProps: EduReelProps = {
  audioUrl: '',
  wordTimestamps: [
    { word: 'Hello', start: 0, end: 0.5 },
    { word: 'World', start: 0.5, end: 1 },
    { word: 'This', start: 1, end: 1.3 },
    { word: 'is', start: 1.3, end: 1.5 },
    { word: 'a', start: 1.5, end: 1.6 },
    { word: 'test', start: 1.6, end: 2 },
  ],
  duration: 10,
  captionStyle: 'tiktok_bounce',
  primaryColor: '#0f0f23',
  accentColor: '#00ff88',
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="EduReel"
        component={EduReelComposition}
        durationInFrames={30 * 60} // Max 60 seconds at 30fps
        fps={30}
        width={1080}
        height={1920}
        defaultProps={defaultProps}
        calculateMetadata={async ({ props }) => {
          return {
            durationInFrames: Math.ceil(props.duration * 30),
          };
        }}
      />
    </>
  );
};

registerRoot(RemotionRoot);

export { EduReelComposition };
export type { EduReelProps };
