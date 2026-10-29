import { Container, Graphics } from 'pixi.js';
import type { BoardLayout } from '../core/board';
import { BOARD_PADDING, BOARD_UNIT_PX, PEG_COLOR, PEG_RADIUS } from '../config';

export function createBoardView(layout: BoardLayout): Container {
  const pegs = new Graphics();
  for (const peg of layout.pegs) {
    pegs.circle(peg.x * BOARD_UNIT_PX, peg.y * BOARD_UNIT_PX, PEG_RADIUS * BOARD_UNIT_PX);
  }
  pegs.fill(PEG_COLOR);

  const view = new Container();
  view.addChild(pegs);
  return view;
}

/** Scales and centers the board so it fits the screen, keeping BOARD_PADDING free on each side. */
export function fitBoardToScreen(
  view: Container,
  layout: BoardLayout,
  screenWidth: number,
  screenHeight: number,
): void {
  const boardWidth = (layout.width + 2 * PEG_RADIUS) * BOARD_UNIT_PX;
  const boardHeight = (layout.height + 2 * PEG_RADIUS) * BOARD_UNIT_PX;
  const available = 1 - 2 * BOARD_PADDING;
  const scale = Math.min(
    (screenWidth * available) / boardWidth,
    (screenHeight * available) / boardHeight,
  );

  view.scale.set(scale);
  // The view's origin is the top-center peg row, so shift down by one peg radius past the top edge.
  const top = (screenHeight - boardHeight * scale) / 2;
  view.position.set(screenWidth / 2, top + PEG_RADIUS * BOARD_UNIT_PX * scale);
}
