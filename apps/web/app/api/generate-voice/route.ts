import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';

const VoiceRequestSchema = z.object({
  script: z.string().min(1).max(5000),
  voiceId: z.string().default('21m00Tcm4TlvDq8ikWAM'), // Rachel - default
  speed: z.number().min(0.5).max(2).default(1),
});

export async function POST(request: Request) {
  try {
    // Skip auth in dev mode
    let userId = 'dev-user';
    if (process.env.SKIP_AUTH !== 'true') {
      const authResult = await auth();
      if (!authResult.userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      userId = authResult.userId;
    }

    const body = await request.json();
    const parseResult = VoiceRequestSchema.safeParse(body);
    
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parseResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { script, voiceId, speed } = parseResult.data;

    if (!process.env.ELEVENLABS_API_KEY) {
      // Mock response for demo
      return NextResponse.json({
        audioUrl: '/mock-audio.mp3',
        duration: Math.ceil(script.split(' ').length / 2.7), // Estimate based on words
        wordTimestamps: generateMockTimestamps(script),
      });
    }

    // Generate speech with ElevenLabs
    const audioResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': process.env.ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text: script,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.5,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!audioResponse.ok) {
      console.error('ElevenLabs error:', await audioResponse.text());
      return NextResponse.json(
        { error: 'Failed to generate voice' },
        { status: 500 }
      );
    }

    const data = await audioResponse.json();
    
    // Extract word timestamps from alignment data
    const wordTimestamps = extractWordTimestamps(data.alignment);
    
    // Convert audio to base64 data URL (for simplicity - in production, upload to S3/R2)
    const audioBase64 = data.audio_base64;
    const audioUrl = `data:audio/mpeg;base64,${audioBase64}`;
    
    // Calculate duration from timestamps
    const duration = wordTimestamps.length > 0 
      ? wordTimestamps[wordTimestamps.length - 1].end 
      : script.split(' ').length / 2.7;

    return NextResponse.json({
      audioUrl,
      duration,
      wordTimestamps,
    });
  } catch (error) {
    console.error('Generate voice error:', error);
    return NextResponse.json(
      { error: 'Failed to generate voice' },
      { status: 500 }
    );
  }
}

function extractWordTimestamps(alignment: any): Array<{ word: string; start: number; end: number }> {
  if (!alignment?.characters) return [];
  
  const timestamps: Array<{ word: string; start: number; end: number }> = [];
  let currentWord = '';
  let wordStart = 0;
  let wordEnd = 0;

  alignment.characters.forEach((char: string, i: number) => {
    const charStart = alignment.character_start_times_seconds?.[i] || 0;
    const charEnd = alignment.character_end_times_seconds?.[i] || charStart + 0.1;

    if (char === ' ' || char === '\n') {
      if (currentWord.trim()) {
        timestamps.push({
          word: currentWord.trim(),
          start: wordStart,
          end: wordEnd,
        });
      }
      currentWord = '';
      wordStart = charEnd;
    } else {
      if (!currentWord) {
        wordStart = charStart;
      }
      currentWord += char;
      wordEnd = charEnd;
    }
  });

  // Don't forget the last word
  if (currentWord.trim()) {
    timestamps.push({
      word: currentWord.trim(),
      start: wordStart,
      end: wordEnd,
    });
  }

  return timestamps;
}

function generateMockTimestamps(script: string): Array<{ word: string; start: number; end: number }> {
  const words = script.split(/\s+/).filter(w => w.length > 0);
  const avgWordDuration = 0.35; // ~170 wpm
  let currentTime = 0;

  return words.map(word => {
    const start = currentTime;
    const duration = avgWordDuration * (0.8 + Math.random() * 0.4); // Some variation
    currentTime += duration;
    return {
      word: word.replace(/[^\w']/g, ''),
      start,
      end: currentTime,
    };
  });
}
