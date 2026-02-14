import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import OpenAI from 'openai';
import { z } from 'zod';

// Input validation schema
const ConceptSchema = z.object({
  topic: z.string().min(1, 'Topic is required').max(500, 'Topic too long'),
  targetAudience: z.string().max(200).optional(),
  duration: z.union([z.literal(15), z.literal(30), z.literal(60), z.literal(90)]).default(60),
  tone: z.enum(['educational', 'casual', 'professional', 'entertaining']).default('educational'),
  keyPoints: z.array(z.string()).max(5).optional(),
});

export async function POST(request: Request) {
  try {
    // Check authentication with Clerk
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse and validate input
    const body = await request.json();
    const parseResult = ConceptSchema.safeParse(body.concept);
    
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parseResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    
    const concept = parseResult.data;

    // If no API key, return mock data for demo purposes
    if (!process.env.OPENAI_API_KEY) {
      const mockScript = generateMockScript(concept);
      return NextResponse.json({ script: mockScript });
    }

    const openai = new OpenAI();
    const prompt = buildPrompt(concept);

    const response = await openai.responses.create({
      model: 'gpt-5.2',
      input: `${SYSTEM_PROMPT}\n\n${prompt}`,
      reasoning: { effort: 'medium' },
    });

    const content = typeof response.output === 'string' 
      ? response.output 
      : JSON.stringify(response.output);

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
        estimatedDuration: concept.duration,
      },
    });
  } catch (error) {
    console.error('Generate script error:', error);
    return NextResponse.json(
      { error: 'Failed to generate script. Please try again.' },
      { status: 500 }
    );
  }
}

const SYSTEM_PROMPT = `You are an elite viral content strategist who has studied thousands of top-performing educational reels on TikTok, Instagram, and YouTube Shorts.

Your expertise includes:
- Pattern interrupts that reset viewer attention every 8-10 seconds
- Psychological hooks that exploit curiosity gaps
- Story loops that create "I need to know what happens next" tension
- Emotional triggers that drive shares and saves

VIRAL REEL FORMULA YOU FOLLOW:

**THE HOOK (0-3 seconds) - STOP THE SCROLL**
Use one of these proven hook types:
- Controversy: "Everyone's been doing [X] wrong..."
- Curiosity gap: "The reason [surprising thing] will shock you"
- Direct challenge: "You won't believe what happens when..."
- Bold claim: "This one trick changed everything about [X]"
- Pattern interrupt: Start mid-sentence or with unexpected visual cue

**THE SETUP (3-10 seconds) - CREATE STAKES**
- Establish why this matters RIGHT NOW
- Create FOMO or urgency
- Make it personal: "I used to think..." / "Before I knew this..."

**THE MEAT (10-45 seconds) - DELIVER VALUE**
- Use the "1-2-3" structure (3 punchy points max)
- Each point should be tweetable on its own
- Include "wait for it" moments
- Add micro-hooks: "But here's where it gets crazy..."
- Use contrasts: "Most people do X, but the pros do Y"

**THE PAYOFF (last 5-10 seconds) - STICK THE LANDING**
- Deliver the "aha moment"
- Create shareability: "Tag someone who needs this"
- Soft CTA that feels natural, not salesy
- Open loop for next video: "Part 2 coming..."

VOICE & STYLE:
- Speak like you're telling a friend a secret, not lecturing
- Use "you" constantly - make it about THEM
- Short sentences. Fragments work. Like this.
- Rhetorical questions to keep engagement
- Power phrases: "Here's the thing", "Plot twist", "Game changer", "Real talk"

PACING (for voiceover):
- 2.5-3 words per second for clarity
- Pause after hooks for emphasis
- Speed up slightly during value dumps
- Slow down for the payoff

Always output valid JSON. The fullScript should read naturally when spoken aloud - no stage directions, just pure spoken words.`;

function generateMockScript(concept: z.infer<typeof ConceptSchema>) {
  const topic = concept.topic || 'this amazing topic';
  const duration = concept.duration || 60;
  
  return {
    hook: `Stop scrolling. What I'm about to tell you about ${topic} is going to change everything.`,
    setup: `I spent 3 years getting this wrong. Then I discovered something that the experts don't want you to know.`,
    content: [
      `First - forget everything you've heard about ${topic}. Most of it is outdated.`,
      `Here's the real secret: it's not about working harder, it's about this one shift.`,
      `The people who get this? They're miles ahead. The ones who don't? Still stuck.`,
    ],
    callToAction: `Save this before it gets buried. Follow for part 2 where I show you exactly how to do it.`,
    fullScript: `Stop scrolling. What I'm about to tell you about ${topic} is going to change everything.

I spent 3 years getting this wrong. Then I discovered something that the experts don't want you to know.

First - forget everything you've heard about ${topic}. Most of it is outdated.

Here's the real secret: it's not about working harder, it's about this one shift in how you think about it.

The people who get this? They're miles ahead. The ones who don't? Still stuck in the same place wondering why nothing works.

Save this before it gets buried. Follow for part 2 where I show you exactly how to do it.`,
    estimatedDuration: duration,
  };
}

function buildPrompt(concept: z.infer<typeof ConceptSchema>) {
  const wordsPerSecond = 2.7;
  const targetWords = Math.floor(concept.duration * wordsPerSecond);

  return `Create a viral educational reel script that will STOP THE SCROLL.

TOPIC: "${concept.topic}"

SPECS:
- Duration: ${concept.duration} seconds
- Target word count: ~${targetWords} words (at 2.7 words/sec for clear delivery)
- Tone: ${concept.tone}
${concept.targetAudience ? `- Target audience: ${concept.targetAudience}` : '- Target audience: General social media users interested in learning'}
${concept.keyPoints?.length ? `- Must include these points: ${concept.keyPoints.join(', ')}` : ''}

REQUIREMENTS:
1. Hook must create instant curiosity - make them NEED to keep watching
2. Include at least 2 "pattern interrupts" (unexpected transitions, rhetorical questions, "but wait" moments)
3. Every sentence must earn its place - cut anything that doesn't add value or momentum
4. End with a CTA that feels natural, not desperate
5. The script should feel like advice from a smart friend, not a lecture

HOOK STYLES TO CONSIDER:
- "Nobody talks about this, but..."
- "I was today years old when I learned..."
- "POV: You finally understand [topic]"
- "The [topic] advice that actually works:"
- "Why does nobody teach this in school?"

Output as JSON:
{
  "hook": "The scroll-stopping opening line (first 3 seconds)",
  "setup": "The stakes/context that makes them care (next 5-7 seconds)",
  "content": ["Point 1 with punch", "Point 2 with insight", "Point 3 with payoff"],
  "callToAction": "Natural ending CTA",
  "fullScript": "The complete script as it should be read aloud - conversational, engaging, no filler",
  "estimatedDuration": ${concept.duration},
  "hooks_used": ["list the psychological hooks/techniques used"]
}`;
}
