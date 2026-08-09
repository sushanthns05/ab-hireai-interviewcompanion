Implement anti-cheat protections for the Live Interview session in ABInterviewIQ.

1. DISABLE COPY / TEXT SELECTION / SCREENSHOTS (best-effort, client-side)
   - Disable text selection on the interview question/answer area using CSS
     (user-select: none) on the relevant containers.
   - Disable right-click context menu during an active interview session
     (oncontextmenu return false, scoped only to the interview page/component).
   - Block copy events (oncopy / clipboard event listeners) on the question text —
     preventDefault() and optionally show a small toast: "Copying is disabled during the
     interview."
   - Disable common devtools/inspect shortcuts while an interview is active:
     Ctrl+C, Ctrl+U, Ctrl+Shift+I, F12, Ctrl+P (print, since print-to-PDF can screenshot).
     Intercept via keydown listener, preventDefault on match.
   - Note in a code comment: these are deterrents, not guarantees — screenshots via OS-level
     tools (Snipping Tool, phone camera, etc.) cannot be blocked from the browser. Don't
     oversell this to the user as foolproof; the UI copy should say "Screen capture
     restrictions active" not "screenshots are impossible."

2. FULLSCREEN ENFORCEMENT
   - When the Live Interview starts, request fullscreen via the Fullscreen API
     (requestFullscreen()).
   - Listen for fullscreenchange events. If the user exits fullscreen at any point during
     the interview, treat it as a violation (see warning system below) and immediately
     re-prompt fullscreen.

3. TAB-SWITCH / VISIBILITY DETECTION
   - Listen for the document visibilitychange event and window blur event to detect tab
     switches or window switching.
   - Each tab-switch OR fullscreen-exit event counts as ONE violation toward the same
     counter (don't count them separately — one shared strike count).

4. WARNING SYSTEM (escalating, 4-strike rule)
   - Maintain a violation counter in component state, starting at 0.
   - On violation #1, #2, #3:
     - Show a modal/overlay immediately when the user returns to the tab/fullscreen:
       "Warning [X]/3: Switching tabs or exiting fullscreen is not allowed during the
       interview. [X] more violation(s) will end your interview automatically."
     - Modal must have a single "Return to Interview" button that re-enters fullscreen and
       dismisses the modal — no way to dismiss without acknowledging.
     - Pause the interview timer (if one exists) while the warning modal is showing, so the
       user isn't penalized on time for the warning itself.
   - On violation #4 (the 4th tab-switch/fullscreen-exit):
     - Immediately end the interview session — do not show a "return" option.
     - Navigate to a dedicated "Interview Terminated" screen with message:
       "Your interview was ended automatically due to repeated tab-switching or exiting
       fullscreen. This is recorded as a policy violation."
     - Submit/save whatever answers were completed up to that point (reuse existing
       submit/autosave logic if it exists), flagged with a status like
       terminated_violation: true so it's distinguishable from a normal completion in any
       results/history view.

5. UI FOR VIOLATION COUNT
   - Show a small persistent indicator during the interview (e.g. top-right corner) like
     "Violations: 1/3" so the candidate always knows where they stand — don't make it a
     surprise.

6. SCOPE
   - All of this logic should activate ONLY during an active Live Interview session (from
     interview start to submission/termination) and fully deactivate afterward — restore
     normal copy/right-click/selection behavior on the rest of the app, including Mock
     Interview mode unless Mock Interview also needs this (confirm scope: apply to Live
     Interview only by default).

7. EDGE CASES TO HANDLE
   - If the user closes the browser tab/window entirely (not just switches), attempt to
     autosave current progress via a beforeunload handler, but this should NOT count as one
     of the 4 strikes (they can't "return" from a closed tab) — treat it as an incomplete/
     abandoned session in whatever state you persist.
   - If fullscreen request is denied/blocked by the browser, show a blocking message asking
     the user to allow fullscreen before the interview can begin.

STYLING

- Warning modal and termination screen should match existing dark glass-card aesthetic
  (rounded-2xl, dark translucent background, border-white/10), with warning modal using an
  amber/red accent for urgency and termination screen using a red accent.

Reuse any existing anti-cheat logic already present in the SET exam portal codebase if
accessible/similar — same visibilitychange + fullscreen pattern likely already exists there.
