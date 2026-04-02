# Bob — Design Document

**One theme, one palette, four components, two screen templates.** Keep this doc short; everything else follows from it.

---

## 1. Theme (one sentence)

**Bold clarity with gamified cues:** high contrast, blocky layout, oversized type, and clear status (READY / NOT READY) so anyone can use the app at a glance on a busy site.

---

## 2. Colors & type — we only use these

**Colors**

- **Primary** — Used for main success/positive actions (e.g. READY, confirm, mark resolved). Strong, confident hue.
- **Neutral background** — Light gray or off-white for screens and cards. Keeps focus on content.
- **Accent (problem/blocked)** — Used for NOT READY, OPEN, high priority, warnings, and destructive actions. Should pop so issues are unmissable.

**Text sizes (exactly three)**

- **Title** — Screen headers and main headings. Large, bold, sans-serif.
- **Body** — Main content, labels, button text. Medium, highly legible sans-serif.
- **Caption** — Timestamps, IDs, secondary info. Smaller but still readable sans-serif.

**Rule:** We only use these colors and these three text sizes. No one-off colors or font sizes on feature screens.

---

## 3. Shared components — everyone uses these

Wrap the basics and use them everywhere. No raw `Text` or `TouchableOpacity` on feature screens; always go through these so the app stays consistent.

| Component | Purpose |
|-----------|---------|
| **AppText** | All text. Variants: `title`, `body`, `caption`. Optional `bold`. |
| **Button** | All actions. Variants: `primary` (main CTA), `secondary` (e.g. filters, confirm with photo). Same height, clear hierarchy. |
| **Screen** | Root wrapper for every screen: standard padding + neutral background. |
| **Card** | Content blocks: reminders, list rows, issue cards. Same border/shadow and padding. |

**Rule for the team:** No raw `Text` / `TouchableOpacity` on feature screens—always use AppText, Button, Screen, and Card. New UI should look consistent without extra design decisions.

---

## 4. Component APIs (short reference)

**AppText**

- `variant`: `'title'` | `'body'` | `'caption'`
- `bold?: boolean`
- `children`, optional `style` override

**Button**

- `variant`: `'primary'` | `'secondary'`
- `onPress`, `title` (string)
- Optional `icon` (e.g. camera, filter)
- Optional `disabled`

**Screen**

- `children`
- Optional `padding` override; otherwise use default horizontal + vertical padding.

**Card**

- `children`
- Optional `accent` (e.g. colored left border for reminders)
- Same padding and border/shadow on all cards.

---

## 5. Standard screens — copy these layouts

Two reference screens. **New screens should copy one of these unless there’s a strong reason not to.**

### 5.1 Daily 2 p.m. check-in screen

- **Implementation:** `screens/TwoPMCheckScreen.js` — uses **Screen**, **AppText** (title / body / caption only), **Button** (`primary` + `tone` positive/negative for Ready / Not ready; `secondary` for photo), and **Card** (accent border for reminders). Stack header is hidden; in-screen header row = back, brand **Bob**, **2:00 PM** right.
- **Header:** Logo/brand left, “2:00 PM” (or current check-in time) right.
- **Main content:** One clear question (“Is the site ready?”) with optional short illustration or icon (emoji block).
- **Primary actions:** Two large **Button**s — **Ready** (`primary`, positive tone) and **Not ready** (`primary`, negative tone). Full-width, equal weight.
- **Secondary action:** **Confirm with photo** (`secondary`) — opens issue flow with photo; visually below primaries.
- **Reminder/info:** One **Card** with accent border for check-in window / next steps copy.
- **Errors/feedback:** **AppText** + theme **accent** where emphasis is needed; keep near the relevant control or inside **Card**.

### 5.2 Issue form / Issue detail screen

- **Header:** Back button left, screen title (e.g. issue name) center, issue ID (e.g. #4578) right.
- **Status:** Tags (OPEN, CLOSED, HIGH PRIORITY) below header using accent for “problem” and primary/neutral for “resolved”.
- **Content:** Task label (e.g. “Task: Framing”), then one large photo thumbnail, then short description (Body/Caption).
- **Actions:** One primary button (e.g. “Mark as resolved”) and one secondary/accent button (e.g. “Close”) at bottom. Full-width, same order every time.
- **Errors:** Inline with accent color; keep near field or at top.

---

## 6. Theme bullet list (paste for team)

- **Theme:** Bold clarity, gamified cues; high contrast, glanceable status.
- **Primary color:** Success / main actions (READY, confirm, resolve).
- **Neutral background:** Light gray or off-white for all screens and cards.
- **Accent color:** Problem/blocked (NOT READY, OPEN, high priority, warnings).
- **Type:** Title, Body, Caption only. Sans-serif, legible.
- **Components:** AppText, Button (primary/secondary), Screen, Card. No raw Text/TouchableOpacity on feature screens.
- **Screens:** New screens copy the 2 p.m. check-in layout or the Issue form layout.

---

*End of design document. One page.*
