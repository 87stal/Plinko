import { Application } from 'pixi.js';
import { BACKGROUND_COLOR } from './config';

async function start(): Promise<void> {
  const root = document.getElementById('app');
  if (!root) throw new Error('#app element not found');

  const app = new Application();
  await app.init({ resizeTo: window, background: BACKGROUND_COLOR, antialias: true });
  root.appendChild(app.canvas);
}

void start();
