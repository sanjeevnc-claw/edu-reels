import { NextResponse } from 'next/server';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function POST(request: Request) {
  try {
    const { concept } = await request.json();

    if (!OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    const prompt = buildPrompt(concept);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an expert viral content creator specializing in educational short-form video scripts. 
You create hook-heavy, engaging scripts optimized for TikTok, Instagram Reels, and YouTube Shorts.
Your scripts are concise, punchy, and designed to keep viewers watching until the end.
Always output valid JSON.`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.8,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      return NextResponse.json(
        { error: 'Failed to generate script' },
        { status: 500 }
      );
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '';

    // Parse the JSON response
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const script = JSON.parse(jsonMatch[0]);
        return NextResponse.json({ script });
      }
    } catch {
      // If JSON parsing fails, return raw content as fullScript
    }

    return NextResponse.json({
      script: {
        hook: '',
        content: [],
        callToAction: '',
        fullScript: content,
        estimatedDuration: concept.duration || 60,
      },
    });
  } catch (error) {
    console.error('Generate script error:', error);
    return NextResponse.json(
      { error: 'Failed to generate script' },
      { status: 500 }
    );
  }
}

function buildPrompt(concept: {
  topic: string;
  duration: number;
  tone: string;
  targetAudience?: string;
  keyPoints?: string[];
}) {
  const wordsPerMinute = 180; // Reels are faster paced
  const targetWords = Math.floor((concept.duration / 60) * wordsPerMinute);

  return `Create a viral educational reel script about: "${concept.topic}"

REQUIREMENTS:
- Duration: ${concept.duration} seconds (~${targetWords} words)
- Tone: ${concept.tone}
${concept.targetAudience ? `- Target audience: ${concept.targetAudience}` : ''}
${concept.keyPoints?.length ? `- Key points to cover: ${concept.keyPoints.join(', ')}` : ''}

STRUCTURE:
1. HOOK (first 3 seconds): Start with a provocative question, surprising fact, or bold statement that stops the scroll
2. CONTENT (middle): Deliver 2-4 key points with energy and clarity
3. CTA (last 3-5 seconds): End with a clear call-to-action (follow, comment, share)

STYLE GUIDELINES:
- Use short, punchy sentences
- Include pattern interrupts every 10-15 seconds
- Make it conversational, not formal
- Create "aha moments" that make viewers want to share
- Use power words: "secret", "actually", "here's why", "nobody tells you"

Output as JSON:
{
  "hook": "Opening line (grabs attention in first 3 seconds)",
  "content": ["Key point 1", "Key point 2", "Key point 3"],
  "callToAction": "Ending CTA",
  "fullScript": "Complete word-for-word script to be read aloud",
  "estimatedDuration": ${concept.duration}
}`;
}
