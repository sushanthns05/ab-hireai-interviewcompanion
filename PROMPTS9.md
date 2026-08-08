Add an "Explore Features" section to ABInterviewIQ that reveals on clicking the existing 
"Explore features" button in the hero.

BEHAVIOR
- Clicking "Explore Features" smoothly scrolls down to a new section below the existing 
  Mock Interview / Live Interview cards (do NOT open a separate route/page — same-page 
  scroll-to-section for demo speed and reliability).
- Alternative if scroll-to-section is awkward with current layout: open a modal/overlay 
  instead, dark backdrop with blur, closable via X or click-outside. Pick whichever fits 
  the current component structure with less refactoring.
- Add a small fade-in/slide-up animation when the section enters view (or when modal opens).

SECTION STRUCTURE
- Section heading: "Everything you need to walk in ready" (or similar benefit-driven line, 
  consistent with existing hero copy tone)
- Below it, a responsive grid of feature cards: 3 columns on desktop, 1 column stacked on 
  mobile, gap-6 between cards

FEATURE CARDS (use these 5 — reuse existing glass-card style: dark translucent background, 
subtle border, icon in a colored circle top-left, matching Mock/Live Interview card pattern):

1. Icon: brain/sparkles (lucide-react "Brain" or "Sparkles")
   Title: "Adaptive Difficulty"
   Description: "Questions adjust in real time based on how well you're answering — no 
   fixed script."

2. Icon: message-square-text (lucide-react "MessageSquareText")
   Title: "Instant AI Feedback"
   Description: "Get scored on clarity, correctness, and structure right after every 
   answer, not just at the end."

3. Icon: shield-check (lucide-react "ShieldCheck")
   Title: "Focus Mode for Live Sessions"
   Description: "Tab-switch detection and fullscreen enforcement keep Live Interviews as 
   close to the real thing as possible."

4. Icon: bar-chart-3 (lucide-react "BarChart3")
   Title: "Performance Analytics"
   Description: "Track score trends across sessions and see exactly which topics need more 
   practice."

5. Icon: history (lucide-react "History")
   Title: "Session Replay"
   Description: "Revisit past interviews with full transcripts and feedback to see how 
   you've improved."

CARD STYLING
- Match existing Mock/Live Interview cards exactly: rounded-2xl corners, dark 
  semi-transparent background (bg-black/30 or similar), 1px subtle border 
  (border-white/10), icon inside a circular badge with a soft gradient/glow background 
  (purple or teal, alternate between the two brand colors across cards)
- Title: bold white, text-lg
- Description: text-sm, muted gray (text-gray-400 or similar), max 2 lines
- Add a subtle hover effect: slight lift (translateY(-4px)) and border brightening, 
  transition 200ms

RESPONSIVE
- Test at both desktop (≥1024px, 3-column grid) and mobile (~380px, single column, full-width 
  cards with reduced padding)

CONSTRAINTS
- Reuse existing color tokens (purple→teal gradient) and font stack — no new design system.
- Keep this to frontend/UI only — feature cards are static/presentational for now, no backend 
  wiring needed unless functionality already exists for a given feature.
- Don't modify the hero, Mock Interview, or Live Interview sections — only add the new 
  section below them.
