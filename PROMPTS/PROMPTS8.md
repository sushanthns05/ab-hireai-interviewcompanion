PROMPTS 08:

Redesign the landing/hero section of ABInterviewIQ (dashboard). Merge the strongest
elements of two existing versions into one final design.

CONTEXT

- Current design (v1): dark navy background with purple/teal aurora particle effects,
  glass-morphism cards, "IQ" gradient logo lockup, two equal-weight cards (Mock Interview /
  Live Interview)
- Alternative design (v2): purple-to-blue gradient hero, badge pill ("AI-powered interview
  practice"), bold headline "Turn interview anxiety into confidence" with gradient text on
  "confidence", subtext, primary+secondary CTA buttons, feature cards below

GOAL: Keep v1's visual polish (dark background, particle/aurora effect, glass cards, logo),
but replace the copy structure and CTA hierarchy with v2's pattern.

IMPLEMENT THE FOLLOWING HERO STRUCTURE:

1. Header: keep existing "IQ" logo + "ABInterviewIQ" wordmark, top-left, on the dark
   aurora/particle background — no change here.

2. Add a small pill/badge above the headline: a dot + text "AI-powered interview practice",
   subtle border, low-opacity dark background, centered.

3. Replace "Welcome to ABInterviewIQ" headline with a benefit-driven headline in the style of
   "Turn interview anxiety into confidence" — large, bold, white text with the last word (or
   key phrase) in a gradient (purple → teal, matching the existing brand gradient). Keep it
   to 3 lines max on desktop.

4. Subtext below headline: one sentence describing what the product does and the outcome
   (adaptive AI feedback, sharpens answers, adapts to skill level) — muted gray, centered,
   max-width ~600px so it doesn't stretch full-width.

5. CTA row below subtext:
   - Primary button: "Start Practicing" with a right-arrow icon, filled with the purple→teal
     gradient, rounded-full or rounded-xl, white bold text
   - Secondary button: "Explore Features", outlined/ghost style, same corner radius, sits
     next to the primary button
   - Do NOT make Mock/Live Interview cards the primary CTA anymore — they become secondary
     content below the fold, not the main decision point

6. Below the CTA row, keep the two existing cards (Mock Interview / Live Interview) but
   demote them visually — smaller heading weight, presented as "choose your mode" secondary
   content, not the hero's main focal point. Keep v1's glass-card style (dark translucent
   background, subtle border, icon in colored circle) exactly as-is.

7. Preserve the existing aurora/particle background effect on both sides — don't replace it
   with a flat gradient.

RESPONSIVE REQUIREMENTS

- Must look correct on both desktop (≥1024px) and mobile (~380px viewport) — test both.
  Headline should scale down on mobile (badge → headline → subtext → stacked CTAs → cards),
  matching the vertical stacked mobile layout already shown in the reference screenshot.
- On mobile, CTA buttons can stack full-width if needed instead of side-by-side.

STYLE CONSTRAINTS

- Keep existing color tokens/gradient (purple/violet → teal/cyan) — don't introduce new brand
  colors.
- Use existing font stack; only change weight/size, not typeface.
- Don't remove or restyle the "Edit with Lovable" badge or any existing dev tooling overlays.

Do not touch backend/interview logic — this is a hero-section visual/copy refactor only.

AI OUTPUT:

I have updated the landing/hero section of ABInterviewIQ in src/routes/index.tsx based on the provided requirements and references.

Here's a summary of what's been changed:

1. Added the Hero Badge: Placed above the headline with a teal dot and "AI-powered interview practice".
2. Updated the Headline: Replaced the previous generic welcome headline with "Turn interview anxiety into confidence.", featuring the brand gradient on the word "confidence" with a large, bold presentation.
3. Added Subtext: Added a descriptive sentence below the headline to establish clarity about what the product offers.
4. Introduced Primary and Secondary CTAs: Added the "Start Practicing" primary button featuring a gradient fill and right-arrow icon, paired with an "Explore features" outlined ghost button.
5. Demoted Interview Cards Visual Hierarchy: The existing Mock/Live interview cards have been moved below the CTAs. Their headings have been scaled down and icons aligned to the left, functioning as secondary "choose your mode" cards.
6. Preserved Existing Visuals: Kept the existing dark background, aurora/particle effect, and the glass-morphism panel aesthetic for the cards below the fold. Responsive classes have been included to stack elements elegantly on mobile viewports.

The changes should be live in your preview environment! Let me know if you would like me to adjust any of the stylings or padding.
