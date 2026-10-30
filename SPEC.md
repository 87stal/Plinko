# Plinko — Specification (v1)

## 1. Overview
A single-player browser Plinko game with play money. The player sets a bet and drops a ball. The ball bounces through 8 rows of pegs and lands in one of 9 slots, and the bet is multiplied by that slot's multiplier.

The core rule is that **the outcome is decided before any animation starts.** A seeded RNG produces the ball's path, the path determines the slot, and the slot determines the payout. The view only plays back a result that already exists.

## 2. Gameplay

### 2.1 Board
- Fixed at **8 rows**. Row `r` (0-based) has `r + 3` pegs, so the bottom row leaves **9 slots** (`rows + 1`).
- The row count is not configurable by the player. It lives in `config.ts` as `BOARD_ROWS`.
- **Geometry** (board units, peg spacing = 1, origin at the top-centre peg):
  - Peg `i` in row `r` sits at `x = i − (r + 2) / 2`, `y = r`.
  - The ball starts above `x = 0` and hits **exactly one peg per row**: first the middle peg of row 0, then on each row it moves `x ± 0.5` (left / right).
  - After 8 decisions the ball is at `x = k − 4`, where `k` is the number of "right" decisions. That is the centre of slot `k`, the gap between two bottom-row pegs.
  - Slots are drawn below the bottom row. The vertical offset lives in `config.ts`.
  - The outermost pegs of each row are never hit. They only frame the board.

### 2.2 Round flow
1. The player enters a bet and presses **Drop** (or Space).
2. Core generates the path and slot, then computes the payout.
3. The round is **settled immediately**: the real balance becomes `balance − bet + payout` and is saved right away.
4. The displayed balance drops by the bet, and the view animates the ball along the path.
5. When the ball lands, the displayed balance catches up to the real balance, and the last-result readout and history update.
6. Drop becomes available again.

Money is settled before the animation, just like the outcome. The animation never affects the balance. Reloading mid-flight, a hidden tab, or a paused ticker can only delay the display, never change the result.

### 2.3 One ball at a time
- While a ball is in flight, Drop, the bet controls and Reset balance are disabled.
- There is no auto-bet.

### 2.4 Balance
- Play money. Starting balance: **1000.00** (`config.ts`).
- There are two values:
  - **Real balance:** the settled balance. Lives in core and is saved to `localStorage` on every change (each settlement and each reset). Restored on load.
  - **Displayed balance:** UI-only. It is the real balance minus the payouts of balls still in flight.
- **Reset balance:**
  - No confirmation.
  - Sets the balance to 1000.00 and clears the history and the last result.
- If `localStorage` is unavailable or holds invalid data, the game falls back to the starting balance and the default bet.

### 2.5 Bet
- Text input (`inputmode="decimal"`) with **½** and **2×** buttons.
- **Units:** the bet is in currency units with up to 2 decimals, so "1" means 1.00. Internally it is integer cents.
- **Limits:** min bet **1.00**, max bet **100.00** (`config.ts`: `MIN_BET_CENTS = 100`, `MAX_BET_CENTS = 10000`).
- **Default and memory:** the default bet is **1.00**. The last valid bet is saved in `localStorage` together with the balance and restored on load.
- **Parsing:**
  - Leading and trailing whitespace is trimmed.
  - Accepted form: digits with an optional decimal separator (`.` or `,`) and at most 2 decimals.
  - Any other input reverts to the last valid bet on blur.
  - While the field holds input that isn't valid yet, Drop is disabled.
- **Validation:** Drop is disabled when the bet is below min, above max, or above balance. A short reason is shown under the bet field:
  - `Min 1.00`
  - `Max 100.00`
  - `Exceeds balance`
- **Balance < min bet:**
  - The bet controls and Drop are disabled, and Reset balance stays available.
  - `Not enough balance — press Reset` is shown next to Drop.
- **Balance ≥ min bet:**
  - ½ and 2× clamp the bet to [min, min(max, balance)].
  - ½ rounds **down** to whole cents before clamping.

## 3. Math

### 3.1 Path
- A path is 8 independent left/right decisions, each 50/50.
- Slot index = number of "right" decisions (0–8).
- So P(slot k) = C(8, k) / 256 → `1, 8, 28, 56, 70, 56, 28, 8, 1` out of 256.

### 3.2 Paytable (single, symmetric)

| Slot        | 0   | 1   | 2   | 3 | 4   | 5 | 6   | 7   | 8   |
|-------------|-----|-----|-----|---|-----|---|-----|-----|-----|
| Multiplier  | 5.6 | 2.1 | 1.1 | 1 | 0.5 | 1 | 1.1 | 2.1 | 5.6 |
| P (/256)    | 1   | 8   | 28  | 56| 70  | 56| 28  | 8   | 1   |

- **Theoretical RTP = 253.4 / 256 ≈ 98.98%.**
- Because payouts are floored to whole cents, the effective RTP is slightly lower for some bet sizes. This loss is accepted.
- The paytable lives in `config.ts`. There are no risk levels.
- **Tests:**
  - **Exact:** the theoretical RTP is computed from the paytable and binomial probabilities, with no simulation. The test also checks that the paytable has 9 entries and is symmetric.
  - **Simulation:** a seeded run of many drops. Its measured RTP must be within **±1%** of the theoretical value.

### 3.3 RNG
- PRNG: **mulberry32** with a **32-bit seed**, implemented in `src/core/` with no dependencies.
- Game: the seed is random, generated once at startup via `crypto.getRandomValues`. Tests: fixed seeds.
- **One random value in [0, 1) per row:** `< 0.5` means left, `≥ 0.5` means right.
- Each drop consumes the next 8 values from the same stream.
- The seed is internal and never shown in the UI.

### 3.4 Money
- Balance and bet are stored as **integer cents**.
- Multipliers are stored in `config.ts` as **integer hundredths**: `560` = ×5.6, so the paytable is `[560, 210, 110, 100, 50, 100, 110, 210, 560]`.
- Payout = `floor(betCents × multiplierHundredths / 100)`, rounded down to whole cents using integer maths only.
- Amounts are displayed with 2 decimal places.

## 4. View (PixiJS v8)

### 4.1 Board rendering
- Pegs, slots and the ball are drawn with `Graphics`, and the slot labels with `Text`. There are no image assets.
- Each slot shows its multiplier as text.
- The board scales to fit its container (existing behavior).

### 4.2 Ball animation
- The motion is scripted along the precomputed path, with no physics engine.
- It looks physical: gravity-like acceleration between rows, and squash/bounce easing on each peg contact.
- The peg the ball hits **flashes** briefly.
- No slot pulse and no floating payout text in v1.
- **Target duration:** about **2 s** for a full drop through 8 rows. As a guide if variable rows are ever added, up to 3 s for 16 rows.
- Timing values (row duration, easing, flash length) live in `config.ts`.

### 4.3 Sound
- Sound effects are synthesised with the **Web Audio API**, with no audio files:
  - peg tick on each contact
  - landing sound
  - a distinct win sound when the payout is greater than the bet
- **Mute** toggle. The mute state is saved in `localStorage`.
- The audio context starts on the first user gesture, as browser autoplay rules require.

## 5. UI (DOM)
- The controls are HTML/CSS elements next to the Pixi canvas, not drawn in Pixi.
- They are:
  - balance display
  - bet input with ½ / 2× buttons and a reason line under it
  - Drop button with a low-balance message next to it
  - Reset balance button
  - mute toggle
  - last-result readout showing the **gross payout**, e.g. `×2.1 → Win 21.00`
  - history of the last **10** results, newest first. It shows **multipliers only** (e.g. `×2.1`, `×0.5`) in three colours:
    - win colour: > 1
    - neutral colour: exactly ×1
    - loss colour: < 1
- History and the last result are kept in memory only and reset on reload.
- **Layout:**
  - Wide screens: the panel sits beside the board.
  - Narrow screens: the panel stacks under the board.
  - It is touch-friendly, with tap targets of at least 44px.
- **Keyboard:** Space = Drop, when Drop is enabled and focus is not in the bet input.

## 6. Architecture
- `src/core/`: board layout, RNG, path generation, payout, bet parsing and validation, balance logic. It is pure, has no PixiJS or DOM imports, and is fully unit-tested.
- `src/view/`: board and ball rendering and animation. It receives a finished result and plays it back, and never decides outcomes.
- `src/ui/`: DOM controls, the `localStorage` adapter, and audio.
- `src/main.ts`: wiring only.
- `src/config.ts`: all tunable numbers (rows, paytable, limits, colors, timings).

## 7. Out of scope (v1)
- Variable row count, risk levels, multiple paytables.
- Multiple balls in flight, auto-bet.
- Visible or user-entered seeds, provably-fair verification.
- Real money, accounts, backend, any network calls *(not planned for now)*.
- Physics engines (e.g. Matter.js). The animation is scripted.
- Leaderboards, achievements, social sharing.
- Localization. The UI is in English only.
- Image files. Everything is drawn with `Graphics` and `Text`.
- Audio files. Sounds are synthesised (see 4.3).

## 8. Open questions (deferred)
- **Landing and win sounds:** on a win, do both the landing and the win sound play, and in what order? What sound does ×1 (break-even) get?
- **Mute default:** does a first-time visitor start muted or unmuted?
- **Responsive breakpoint:** at what viewport width does the panel switch from beside the board to stacked under it?
