import { Application } from 'pixi.js';
import { BACKGROUND_COLOR, BOARD_ROWS } from './config';
import { computeBoardLayout } from './core/board';
import { createBoardView, fitBoardToScreen } from './view/boardView';

async function start(): Promise<void> {
  const root = document.getElementById('app');
  if (!root) throw new Error('#app element not found');

  const app = new Application();
  await app.init({
    resizeTo: window,
    background: BACKGROUND_COLOR,
    antialias: true,
    resolution: window.devicePixelRatio,
    autoDensity: true,
  });
  root.appendChild(app.canvas);

  const layout = computeBoardLayout(BOARD_ROWS);
  const board = createBoardView(layout);
  app.stage.addChild(board);

  fitBoardToScreen(board, layout, app.screen.width, app.screen.height);
  app.renderer.on('resize', (width, height) => fitBoardToScreen(board, layout, width, height));
}

void start();
