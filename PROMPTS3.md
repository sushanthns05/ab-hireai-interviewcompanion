Build a web app called "InterviewIQ" — an AI mock-interview agent. 
I want the design and interaction to feel premium and alive, not like 
a generic hackathon CRUD app. Focus especially on two signature moments:

## 1. THINKING VISUALIZATION (while AI generates a question or evaluates an answer)

Instead of a loading spinner, show a live "reasoning trace" panel that 
streams short thought fragments as the AI works, e.g.:
- "Reviewing candidate's last answer for STAR structure..."
- "Checking resume for matching project experience..."
- "Calibrating follow-up difficulty..."

Style: a slim side panel or bottom drawer with a soft pulsing glow, 
monospace font for the trace text, each line fading in with a slight 
typewriter effect, older lines fading to low opacity as new ones appear 
(like a terminal log, not a chat bubble). Keep it snappy — each fragment 
visible ~800ms-1.2s. This should make the AI feel like it's "actually 
thinking," not just calling an API.

## 2. THE LIVE MOMENT — the centerpiece of the demo

During the actual mock interview, show a real-time "Confidence & Clarity" 
meter that updates live as the candidate speaks — think a friendly hybrid 
of a heart-rate monitor and a music equalizer. Requirements:
- A smooth animated waveform/pulse line that reacts to speech pace
- A circular confidence gauge that fills/ticks upward with a satisfying 
  spring animation (like a game score counter, not a linear progress bar)
- Small celebratory micro-interactions when the candidate nails something 
  — e.g. a subtle confetti burst or a friendly "Nice, concrete example!" 
  toast when they mention a specific metric/result in their answer
- Keep the tone professional-cheerful: think Duolingo's warmth crossed 
  with a fintech dashboard's polish — NOT cartoonish, no childish 
  illustrations. Muted confetti colors, understated sound-free 
  celebrations, tasteful easing curves.
- This element should be the one thing that's clearly ANIMATED and ALIVE 
  on an otherwise calm, minimal page — it's the "wow" moment judges 
  remember.

## Design system
- One accent color (pick a confident indigo or teal), neutral gray scale 
  for everything else
- Clean sans-serif for UI (Inter or similar), monospace only for the 
  thinking trace
- Generous whitespace, soft shadows, rounded-but-not-bubbly corners (8-10px)
- Real empty/loading/error states for every screen, not blank placeholders
- Smooth page/section transitions (200-300ms ease-out), no gratuitous motion

## Core screens
1. Landing/setup — upload resume + pick interview type (behavioral/technical) 
   + choose interviewer persona (friendly HR / terse tech lead / panel)
2. Live interview screen — question display, the confidence meter above, 
   thinking trace panel visible when AI is generating the next question
3. Results/report screen — score breakdown, "your answer vs. a stronger 
   version" side-by-side comparison, shareable summary card (Wrapped-style, 
   screenshot-friendly)

## Tech
Use React + Tailwind. Use Framer Motion (or equivalent) for the spring 
animations on the gauge and trace panel. Keep components modular — 
ConfidenceMeter, ThinkingTrace, and ReportCard should be standalone, 
reusable components.

Build this as a working prototype with mock/sample data driving the 
animations first (I'll wire in the real AI calls after), so the visual 
experience can be judged and iterated on immediately.

This should be implemented on the first welcome page only, not on the dashboard
