import { Config } from '@remotion/cli/config';

// Enable webpack caching for faster builds
Config.setWebpackCaching(true);

// Set the entry point
Config.setEntryPoint('./src/index.ts');

// Output settings
Config.setCodec('h264');
Config.setPixelFormat('yuv420p');

// Enable audio
Config.setMuted(false);
