import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';

const RenderRequestSchema = z.object({
  script: z.object({
    hook: z.string().optional(),
    setup: z.string().optional(),
    content: z.array(z.string()).optional(),
    callToAction: z.string().optional(),
    fullScript: z.string(),
  }),
  voiceAudioUrl: z.string(),
  wordTimestamps: z.array(z.object({
    word: z.string(),
    start: z.number(),
    end: z.number(),
  })),
  duration: z.number(),
  settings: z.object({
    voiceId: z.string(),
    avatarMode: z.enum(['face', 'faceless']),
    avatarPosition: z.string().optional(),
    visualStyle: z.string(),
    captionStyle: z.string(),
  }),
});

// Style presets
const STYLE_COLORS: Record<string, { primary: string; accent: string }> = {
  modern_minimal: { primary: '#0f0f23', accent: '#00ff88' },
  bold_colorful: { primary: '#1a0a2e', accent: '#ff6b6b' },
  dark_professional: { primary: '#0d1117', accent: '#58a6ff' },
  bright_casual: { primary: '#fff8e7', accent: '#ff9f43' },
  neon_tech: { primary: '#0a0a0a', accent: '#00ffff' },
  clean_corporate: { primary: '#f8f9fa', accent: '#0066cc' },
};

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parseResult = RenderRequestSchema.safeParse(body);
    
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parseResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { script, voiceAudioUrl, wordTimestamps, duration, settings } = parseResult.data;
    const colors = STYLE_COLORS[settings.visualStyle] || STYLE_COLORS.modern_minimal;

    // Build render props
    const renderProps = {
      audioUrl: voiceAudioUrl,
      wordTimestamps,
      duration,
      captionStyle: settings.captionStyle as 'tiktok_bounce' | 'highlight_word' | 'subtitle_classic',
      primaryColor: colors.primary,
      accentColor: colors.accent,
    };

    // Try different rendering backends in order of preference

    // 1. Remotion Lambda (via function URL)
    if (process.env.REMOTION_LAMBDA_URL) {
      return await renderWithLambda(renderProps, userId);
    }

    // 2. Remotion Cloud (managed service)
    if (process.env.REMOTION_CLOUD_API_KEY) {
      return await renderWithCloud(renderProps, userId);
    }

    // 3. Self-hosted render server
    if (process.env.RENDER_SERVER_URL) {
      return await renderWithServer(renderProps, userId);
    }

    // 4. Demo mode - return explanation + sample video
    return NextResponse.json({
      status: 'demo',
      videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      duration,
      message: 'Video rendering requires one of: REMOTION_LAMBDA_URL (Lambda), REMOTION_CLOUD_API_KEY (Cloud), or RENDER_SERVER_URL (self-hosted)',
      script: script.fullScript,
      wordTimestamps,
      renderProps, // Return props so they can be used elsewhere
    });
  } catch (error) {
    console.error('Render video error:', error);
    return NextResponse.json(
      { error: 'Failed to render video' },
      { status: 500 }
    );
  }
}

// Remotion Lambda rendering via AWS Lambda invoke (no SDK dependency)
async function renderWithLambda(props: any, userId: string) {
  // Use fetch to invoke Lambda directly via function URL or API Gateway
  const lambdaUrl = process.env.REMOTION_LAMBDA_URL;
  if (!lambdaUrl) {
    throw new Error('REMOTION_LAMBDA_URL not configured');
  }

  const response = await fetch(lambdaUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': process.env.REMOTION_LAMBDA_API_KEY || '',
    },
    body: JSON.stringify({
      composition: 'SimpleReel',
      inputProps: props,
      codec: 'h264',
      outName: `reel-${userId}-${Date.now()}.mp4`,
    }),
  });

  if (!response.ok) {
    throw new Error(`Lambda render failed: ${response.statusText}`);
  }

  const result = await response.json();

  return NextResponse.json({
    status: 'completed',
    videoUrl: result.outputFile || result.videoUrl,
    duration: props.duration,
  });
}

// Remotion Cloud rendering (managed service)
async function renderWithCloud(props: any, userId: string) {
  const response = await fetch('https://api.remotion.dev/render', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.REMOTION_CLOUD_API_KEY}`,
    },
    body: JSON.stringify({
      composition: 'SimpleReel',
      inputProps: props,
      codec: 'h264',
      serveUrl: process.env.REMOTION_SERVE_URL,
    }),
  });

  if (!response.ok) {
    throw new Error('Remotion Cloud render failed');
  }

  const result = await response.json();
  
  return NextResponse.json({
    status: 'completed',
    videoUrl: result.outputUrl,
    duration: props.duration,
  });
}

// Self-hosted render server
async function renderWithServer(props: any, userId: string) {
  const response = await fetch(`${process.env.RENDER_SERVER_URL}/render`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.RENDER_SERVER_SECRET || ''}`,
    },
    body: JSON.stringify({
      composition: 'SimpleReel',
      inputProps: props,
      userId,
    }),
  });

  if (!response.ok) {
    throw new Error('Render server failed');
  }

  const result = await response.json();
  
  return NextResponse.json({
    status: 'completed',
    videoUrl: result.videoUrl,
    duration: props.duration,
  });
}
