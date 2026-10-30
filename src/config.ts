export const BACKGROUND_COLOR = 0x1a1b2e;

export const BOARD_ROWS = 8;
/** Pixels per board unit when drawing; the view is then scaled to fit the screen. */
export const BOARD_UNIT_PX = 64;
/** Peg radius as a fraction of peg spacing. */
export const PEG_RADIUS = 0.12;
export const PEG_COLOR = 0xe8e8f0;
/** Fraction of each screen dimension kept empty around the board. */
export const BOARD_PADDING = 0.1;

/** Slot multipliers in integer hundredths (560 = ×5.6), indexed by slot. */
export const PAYTABLE: readonly number[] = [560, 210, 110, 100, 50, 100, 110, 210, 560];
