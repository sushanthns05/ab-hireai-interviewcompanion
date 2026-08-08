Add a new route/page "/features" to ABInterviewIQ. Clicking "Explore features" in the hero 
navigates to this page (client-side routing, not a full page reload).

ROUTING
- Use existing router setup (React Router / Next.js routing — whichever this project already 
  uses). Add route path: /features
- "Explore Features" button in hero becomes a Link/navigate call to /features instead of a 
  scroll anchor.
- Add a "Back" or "← Back to Home" link/button at the top-left of the new page, styled 
  consistent with existing header (same font, muted color, hover state), that returns to "/".

PAGE STRUCTURE (/features)

1. Header: reuse the exact same header component as the home page — "IQ" logo + 
   "ABInterviewIQ" wordmark, top-left, on the same dark aurora/particle background so it 
   feels like the same app, not a different site.

2. Page hero/intro (smaller than home page hero):
   - Small heading: "Explore Features"
   - Subtext: one line, e.g. "Everything built to make your interview practice sharper and 
     more realistic."
   - Keep this compact — this page's job is the content below, not another big hero moment.

3. Feature list — full-width sections, one per feature, alternating layout (icon+text left / 
   visual placeholder right, then flipped on the next one) so the page doesn't feel like a 
   flat repeated grid. Use these 5 features:

   a. Adaptive Difficulty (icon: Brain)
      "Questions adjust in real time based on how well you're answering — no fixed script. 
      The AI reads your response quality and recalibrates the next question's difficulty 
      accordingly."

   b. Instant AI Feedback (icon: MessageSquareText)
      "Get scored on clarity, correctness, and structure right after every answer, not just 
      at the end. See exactly what to improve before you move to the next question."

   c. Focus Mode for Live Sessions (icon: ShieldCheck)
      "Tab-switch detection and fullscreen enforcement keep Live Interviews as close to the 
      real thing as possible — no shortcuts, no second tab."

   d. Performance Analytics (icon: BarChart3)
      "Track score trends across sessions and see exactly which topics need more practice, 
      with a breakdown by subject/skill area."

   e. Session Replay (icon: History)
      "Revisit past interviews with full transcripts and feedback to see how you've improved 
      over time."

   For each section:
   - Icon inside a large circular gradient badge (purple or teal, alternate per section)
   - Title: bold, text-2xl or text-3xl
   - Description: text-gray-400, max-width ~500px, comfortable line-height
   - Right side (or left, alternating): a placeholder visual — a glass-card mockup box with 
     rounded-2xl corners, subtle border, and a simple icon or abstract shape inside, same 
     glass style as the Mock/Live Interview cards on the home page. This is a static visual 
     placeholder, not functional UI.
   - Generous vertical spacing between sections (py-16 or py-20) with a subtle horizontal 
     divider (border-white/5) between each

4. Bottom CTA section: 
   - Heading: "Ready to start practicing?"
   - Button: "Start Practicing" → navigates to wherever the home page's Start Practicing 
     button goes
   - Same gradient button style as home page

STYLING
- Keep the same dark aurora/particle background from the home page, either as one continuous 
  background for the whole page or repeated/extended — don't switch to a flat/plain 
  background, it should feel like the same product.
- Reuse existing color tokens (purple→teal gradient), font stack, and card/glass styling — 
  no new design system.
- Add scroll-triggered fade-in animations for each feature section as the user scrolls down 
  (simple, subtle — opacity + slight translateY).

RESPONSIVE
- Desktop (≥1024px): alternating left/right layout as described.
- Mobile (~380px): stack icon+text above the visual placeholder for every section (no 
  alternating side-by-side on mobile), full-width, reduced padding.

CONSTRAINTS
- Do not modify the home page hero, Mock Interview/Live Interview cards, or navigation — only 
  add the new /features route and wire the button to it.
- Content is static/presentational; no backend wiring needed unless a feature is already 
  functional elsewhere in the app.
