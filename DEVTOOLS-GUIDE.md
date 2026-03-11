# How to Debug the Game on Your Chromebook

When the game freezes or acts weird, Chrome DevTools can tell us exactly what's going wrong. Here's how to use it.

## Opening DevTools

1. Open the game in Chrome: https://minecraft-rpg.vercel.app
2. Press **Ctrl + Shift + J** (this opens the Console tab directly)
3. You'll see a panel pop up on the side or bottom of your screen

## What to Check

### Console Tab (errors)
- Look for anything in **red** — those are errors
- Screenshot any red messages and send them to me
- Common things you might see:
  - "Uncaught TypeError" = something broke in the code
  - "out of memory" = the game used too much RAM
  - "Maximum call stack" = infinite loop froze it

### Performance Tab (freezing)
1. Click the **Performance** tab at the top of DevTools
2. Click the **Record** button (circle icon)
3. Play the game for 10-15 seconds while it's laggy
4. Click **Stop**
5. Screenshot the timeline — it shows where time is being spent
6. Look for:
   - Big yellow blocks = JavaScript taking too long
   - Big green blocks = rendering/painting taking too long
   - Long gaps = the browser is completely stuck

### FPS Counter (quick check)
1. In DevTools, press **Ctrl + Shift + P** to open the command menu
2. Type "fps" and select **Show frames per second (FPS) meter**
3. A small overlay appears in the corner showing your FPS
4. Below 30 = laggy, below 15 = freezing
5. Screenshot this while playing

### Memory Tab (if it gets worse over time)
1. Click the **Memory** tab
2. Select "Take heap snapshot"
3. Play for a minute, then take another snapshot
4. If the second one is way bigger, there's a memory leak

## Quick Checklist When It Freezes

1. Open DevTools (Ctrl + Shift + J)
2. Screenshot any red errors in Console
3. Turn on FPS counter and screenshot it
4. If you can, record a Performance trace for 10 seconds
5. Send me the screenshots

## Your Chromebook Specs

While you're in Chrome, go to **chrome://system** and screenshot the top section. That tells me your CPU and RAM so I can optimize for it.
