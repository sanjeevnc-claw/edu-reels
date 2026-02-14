# EduReels

AI-powered educational reel generator. Transform concepts into viral vertical videos.

**Concept → Script → Voice → Visuals → Reel**

## Features

- 🎯 **Concept to Script** - AI generates hook-heavy, viral scripts from any topic
- 🎤 **AI Voiceover** - Natural ElevenLabs voices with perfect pacing
- 👤 **Face or Faceless** - HeyGen avatar or animated B-roll — your choice
- 📝 **TikTok Captions** - Auto-generated bouncing word captions
- 🎨 **Visual Styles** - 6 preset styles or fully custom colors
- 📊 **Batch Production** - Create 50 reels at once with variations
- 📱 **9:16 Vertical** - Perfect for TikTok, Reels, Shorts
- ⚡ **15-90 Seconds** - Optimized for engagement

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, Tailwind CSS |
| Video Engine | Remotion (9:16 vertical) |
| Database | PostgreSQL (Prisma) |
| Voice | ElevenLabs API |
| Avatars | HeyGen API |
| Script Gen | OpenAI GPT-4 |
| Captions | OpenAI Whisper |

## Project Structure

```
edu-reels/
├── apps/
│   ├── web/              # Next.js frontend
│   └── worker/           # Background jobs
├── packages/
│   ├── shared/           # Types + utilities
│   ├── db/               # Prisma schema
│   └── remotion/         # Vertical video compositions
└── docker-compose.yml
```

## Getting Started

```bash
# Install dependencies
pnpm install

# Start databases
docker-compose up -d

# Generate Prisma client
pnpm db:generate

# Start development
pnpm dev
```

## Environment Variables

```env
DATABASE_URL="postgresql://..."
REDIS_URL="redis://..."
ELEVENLABS_API_KEY="..."
HEYGEN_API_KEY="..."
OPENAI_API_KEY="..."
```

## Workflow

1. **Enter Concept** - Topic, duration (15/30/60/90s), tone, audience
2. **Generate Script** - AI creates hook-heavy viral script
3. **Choose Voice** - Select from 6 ElevenLabs voices
4. **Configure Avatar** - Face (HeyGen) or faceless (B-roll)
5. **Pick Style** - 6 visual presets + caption styles
6. **Generate** - AI creates voice, visuals, captions
7. **Download** - Ready for TikTok, Reels, Shorts

## Caption Styles

- **TikTok Bounce** - Bouncing word-by-word
- **Highlight** - Current word highlighted
- **Karaoke** - Fill-style animation
- **Classic** - Traditional subtitles

## Batch Production

Create multiple reels from a single concept with variations:
- Different hooks
- Different visual styles
- A/B test versions

## API Cost Estimates

| Service | Cost |
|---------|------|
| ElevenLabs | ~$0.30/min |
| HeyGen | ~$0.10-0.50/min |
| OpenAI GPT-4 | ~$0.03/1K tokens |
| Whisper | ~$0.006/min |

For a 60-second reel: **~$1-3**

## License

MIT
# Trigger deploy 1771055945
# Deploy v2 1771055990
