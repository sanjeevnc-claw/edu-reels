import { registerRoot } from 'remotion';
import { Root } from './Root';

registerRoot(Root);

// Export compositions for external use
export { EduReel } from './compositions/EduReel';
export { SimpleReel } from './compositions/SimpleReel';
export { Root };
