# Plinko — Tasks

Rules for every task:
- About an hour of work, a few files at most.
- **core** = pure logic in `src/core/`. Tests are written first and reviewed, then the implementation.
- **view** = everything else: PixiJS rendering, DOM UI, browser adapters and wiring. Checked by running the app.
- Done = all acceptance criteria met **and** `npm run typecheck`, `npm run lint`, `npm test` pass.
- Section numbers (§) refer to SPEC.md. Tasks are listed in dependency order.

---

## Done
- [x] **T0 — Project scaffold**: Vite, TS strict, PixiJS v8, Vitest, ESLint, Prettier.
- [x] **T1 — Board layout + peg rendering**: `core/board.ts` with tests, `view/boardView.ts`, fit-to-screen.

---

## Core

### T2 — Seeded RNG · core
§3.3 · Depends on: — · Files: `core/rng.ts`, `core/rng.test.ts`
- [ ] `createRng(seed: number): () => number` implements mulberry32 with a 32-bit seed.
- [ ] Every value is in [0, 1). This is checked over 10 000 draws.
- [ ] The same seed produces the same sequence, and different seeds produce different sequences.
- [ ] The first 3 values for a fixed seed match hard-coded reference values.

### T3 — Path generation · core
§2.1, §3.1, §3.3 · Depends on: T2 · Files: `core/path.ts`, `core/path.test.ts`
- [ ] `generatePath(rng, rows)` returns `{ decisions: ('L' | 'R')[], slot: number }`.
- [ ] It calls `rng` exactly `rows` times: `< 0.5` → L, `≥ 0.5` → R.
- [ ] `slot` = the number of R decisions, always in 0..rows.
- [ ] A stub RNG returning `[0.49, 0.5, …]` gives the expected path. This covers the 0.5 boundary.
- [ ] It throws `RangeError` for a non-positive or non-integer `rows`.

### T4 — Paytable and payout · core
§3.2, §3.4 · Depends on: — · Files: `config.ts`, `core/payout.ts`, `core/payout.test.ts`
- [ ] `PAYTABLE` in config is `[560, 210, 110, 100, 50, 100, 110, 210, 560]`, in hundredths.
- [ ] `payoutCents(betCents, multiplierHundredths)` = `floor(bet × m / 100)` using integer maths only.
- [ ] Test cases:
  - 100 × 560 → 560
  - 101 × 50 → 50 (flooring)
  - 333 × 110 → 366
  - 0 bet → 0
- [ ] It throws for negative or non-integer inputs.

### T5 — RTP checks · core
§3.2 · Depends on: T2, T3, T4 · Files: `core/rtp.ts`, `core/rtp.test.ts`
- [ ] `theoreticalRtp(paytable)` uses binomial probabilities C(n, k) / 2ⁿ, where n = paytable length − 1.
- [ ] For `PAYTABLE`, it returns exactly 253.4 / 256 (within float epsilon).
- [ ] Tests check that `PAYTABLE` has `BOARD_ROWS + 1` entries and is symmetric.
- [ ] A seeded simulation of 100 000 drops has a measured RTP within ±1% of the theoretical value.

### T6 — Amount parsing · core
§2.5 · Depends on: — · Files: `core/money.ts`, `core/money.test.ts`
- [ ] `parseAmount(text): number | null` returns cents.
- [ ] It trims whitespace and accepts `.` or `,` as the decimal separator, with at most 2 decimals.
- [ ] Accepted: `"1"` → 100, `"2,5"` → 250, `" 0.01 "` → 1, `"10."` → 1000.
- [ ] Rejected (null): `""`, `"-1"`, `"1e2"`, `"1.234"`, `"1,2.3"`, `"abc"`, `"."`.

### T7 — Formatting · core
§3.4, §5 · Depends on: — · Files: `core/money.ts`, `core/money.test.ts`
- [ ] `formatCents(cents)`: 100000 → `"1000.00"`, 5 → `"0.05"`, 0 → `"0.00"`.
- [ ] `formatMultiplier(hundredths)`: 560 → `"×5.6"`, 100 → `"×1"`, 50 → `"×0.5"`.

### T8 — Bet validation · core
§2.5 · Depends on: — · Files: `config.ts`, `core/bet.ts`, `core/bet.test.ts`
- [ ] Config contains `MIN_BET_CENTS = 100`, `MAX_BET_CENTS = 10000`, `STARTING_BALANCE_CENTS = 100000` and `DEFAULT_BET_CENTS = 100`.
- [ ] `validateBet(bet, balance)` returns `'ok' | 'min' | 'max' | 'exceedsBalance'`.
- [ ] `canBet(balance)` is false when `balance < MIN_BET_CENTS`.
- [ ] Tests cover each boundary: 99/100, 10000/10001, and bet = balance versus balance + 1.

### T9 — Bet adjustment (½ / 2×) · core
§2.5 · Depends on: T8 · Files: `core/bet.ts`, `core/bet.test.ts`
- [ ] `halveBet(bet, balance)` floors to whole cents, then clamps to [min, min(max, balance)]. For example, 101 → 50, which clamps to 100.
- [ ] `doubleBet(bet, balance)` clamps to the same range.
- [ ] Both are only defined when `canBet(balance)`. Otherwise they throw.

### T10 — Round settlement · core
§2.2 · Depends on: T3, T4, T8 · Files: `core/game.ts`, `core/game.test.ts`
- [ ] `playRound(balance, bet, rng)` returns `{ newBalance, path, slot, multiplier, payout }`.
- [ ] `newBalance = balance − bet + payout`, computed before any animation.
- [ ] It throws if `validateBet` is not `'ok'`.
- [ ] A fixed seed gives a fixed, asserted result.

### T11 — Result helpers · core
§5 · Depends on: — · Files: `core/history.ts`, `core/history.test.ts`
- [ ] `outcomeKind(multiplier)` returns `'win'` (> 100), `'neutral'` (= 100) or `'loss'` (< 100).
- [ ] `pushHistory(list, entry, max = 10)` returns a new list, newest first, capped at `max`. The input list is not mutated.

### T12 — Persisted state validation · core
§2.4, §2.5, §4.3 · Depends on: T8 · Files: `core/persisted.ts`, `core/persisted.test.ts`
- [ ] `parsePersisted(raw: unknown)` returns `{ balanceCents, betCents, muted }`.
- [ ] Balance falls back to the starting balance if it is missing, negative, non-integer, NaN or the wrong type.
- [ ] Bet falls back to the default if it is missing, invalid, or outside [min, max]. A bet above the balance is kept, because validation shows the reason.
- [ ] Muted falls back to the default if it is not a boolean. The default stays provisional until §8 is answered.
- [ ] A JSON string that fails to parse produces all defaults.

### T13 — Ball waypoints · core
§2.1 · Depends on: T3 · Files: `core/trajectory.ts`, `core/trajectory.test.ts`
- [ ] `pathToWaypoints(decisions)` returns the contact points in board units:
  - `(0, 0)` first
  - then `x ± 0.5` per row
  - then a final point at the slot centre `(k − 4, SLOT_Y)`
- [ ] It returns `rows + 1` points, and each consecutive step changes x by exactly ±0.5.
- [ ] Every contact point equals the position of a real peg from `computeBoardLayout`.

---

## View

### T14 — Slots and multiplier labels · view
§4.1 · Depends on: T4, T7, T11 · Files: `view/boardView.ts`, `config.ts`
- [ ] 9 slot boxes are drawn with `Graphics` below the bottom row, centred at `x = k − 4`.
- [ ] Each box has a `Text` label from `formatMultiplier`, coloured by `outcomeKind`.
- [ ] `fitBoardToScreen` includes the slots, so nothing is clipped at any window size.

### T15 — Page layout · view
§5 · Depends on: — · Files: `index.html`, `src/style.css`, `main.ts`
- [ ] There is a canvas container and an empty panel container.
- [ ] They sit side by side on wide screens and stack on narrow ones. The breakpoint is provisional, see §8.
- [ ] The Pixi canvas resizes to its container, not to the window, and the board refits.
- [ ] There is no horizontal scroll at 360px width.

### T16 — Ball playback (basic) · view
§4.2 · Depends on: T13 · Files: `view/ballView.ts`, `config.ts`
- [ ] `playDrop(waypoints): Promise<void>` moves a `Graphics` ball through every waypoint using the Ticker.
- [ ] The promise resolves exactly once, when the ball reaches the slot centre.
- [ ] A temporary debug trigger in `main.ts` shows a ball landing in the slot chosen by `generatePath`.

### T17 — Gravity easing and timing · view
§4.2 · Depends on: T16 · Files: `view/ballView.ts`, `config.ts`
- [ ] Each row segment follows an arc with gravity-like acceleration, not a straight line.
- [ ] A full drop takes about 2 s (±0.2 s). All timings live in config.
- [ ] Driven by delta time: a long frame gap (e.g. a hidden tab) jumps forward and doesn't stall.

### T18 — Squash and bounce · view
§4.2 · Depends on: T17 · Files: `view/ballView.ts`, `config.ts`
- [ ] The ball squashes briefly on each peg contact and returns to its normal scale.
- [ ] The landing position and timing from T17 are unchanged.

### T19 — Peg flash and hit callback · view
§4.2 · Depends on: T17 · Files: `view/ballView.ts`, `view/boardView.ts`
- [ ] The peg that was hit flashes. Duration and colour live in config.
- [ ] `playDrop` accepts `onPegHit(row)` and `onLand()` callbacks. They fire exactly 8 times and 1 time per drop.

### T20 — Bet input field · view
§2.5 · Depends on: T6, T7, T8, T15 · Files: `ui/betPanel.ts`, `src/style.css`
- [ ] The input uses `inputmode="decimal"` and is parsed with `parseAmount`.
- [ ] On blur, invalid text reverts to the last valid bet, formatted with `formatCents`.
- [ ] A reason line under the field shows `Min 1.00`, `Max 100.00` or `Exceeds balance` from `validateBet`.
- [ ] The panel exposes `getBet()` and `onChange` to the caller. It holds no game logic.

### T21 — Bet buttons, Drop, low-balance message · view
§2.5 · Depends on: T9, T20 · Files: `ui/betPanel.ts`, `src/style.css`
- [ ] ½ and 2× call `halveBet` and `doubleBet`.
- [ ] Drop is enabled only when the bet is valid.
- [ ] When `!canBet(balance)`, the bet controls and Drop are disabled and `Not enough balance — press Reset` is shown.
- [ ] All tap targets are at least 44px.

### T22 — Status panel · view
§5 · Depends on: T7, T11, T15 · Files: `ui/statusPanel.ts`, `src/style.css`
- [ ] Shows the displayed balance.
- [ ] Shows the last result as `×2.1 → Win 21.00`.
- [ ] Shows the last 10 multipliers, newest first, in win, neutral or loss colours.
- [ ] Has setter methods only. It holds no state of its own beyond what it renders.

### T23 — Round wiring · view
§2.2, §2.3 · Depends on: T10, T19, T21, T22 · Files: `main.ts`
- [ ] Drop runs this sequence:
  1. `playRound` with the game RNG (seeded once via `crypto.getRandomValues`).
  2. The displayed balance becomes balance − bet.
  3. `playDrop` runs.
  4. On land, the displayed balance becomes `newBalance`, and the last result and history update.
- [ ] Drop, the bet controls and Reset are disabled while a ball is in flight.
- [ ] The T16 debug trigger is removed.

### T24 — Reset balance · view
§2.4 · Depends on: T23 · Files: `ui/statusPanel.ts` or `ui/betPanel.ts`, `main.ts`
- [ ] Reset sets the balance to 1000.00 and clears the history and the last result. There is no confirmation.
- [ ] It is disabled while a ball is in flight and enabled otherwise, including when the balance is below the minimum bet.

### T25 — Storage adapter · view
§2.4, §2.5 · Depends on: T12, T24 · Files: `ui/storage.ts`, `main.ts`
- [ ] Balance and bet are saved on every settlement, reset and valid bet change, under one versioned key.
- [ ] On load they are read through `parsePersisted`.
- [ ] If `localStorage` throws (private mode or blocked), the game still runs with defaults.
- [ ] A reload mid-flight keeps the already-settled balance.

### T26 — Keyboard · view
§5 · Depends on: T23 · Files: `ui/keyboard.ts`, `main.ts`
- [ ] Space triggers Drop when Drop is enabled.
- [ ] It is ignored when the bet input has focus, and ignored on key repeat.
- [ ] Space on a focused button does not also trigger Drop.

### T27 — Audio engine and mute · view
§4.3 · Depends on: T25 · **Blocked by §8 (mute default)** · Files: `ui/audio.ts`, `main.ts`
- [ ] The Web Audio context is created or resumed on the first user gesture.
- [ ] `tick()`, `land()` and `win()` are synthesised with oscillators and have no file assets.
- [ ] The mute toggle is saved through the storage adapter. If audio is unavailable, the game runs silently and doesn't crash.

### T28 — Sound hooks · view
§4.3 · Depends on: T19, T23, T27 · **Blocked by §8 (landing/win order, ×1 sound)** · Files: `main.ts`
- [ ] `onPegHit` plays `tick`, and `onLand` plays `land`.
- [ ] `win` plays only when payout > bet.
- [ ] Nothing plays while muted.
