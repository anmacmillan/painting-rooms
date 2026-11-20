// A way back to the map for rooms that do not use the shared score panel (which has its own house button).
import { push } from './player.js';
import './offline.js';
setTimeout(() => {
  if (document.getElementById('scHome')) return;
  const b = document.createElement('button'); b.id = 'scHome'; b.type = 'button'; b.textContent = '⌂'; b.title = 'Save and go back to the map';
  b.style.cssText = 'position:fixed;left:12px;bottom:12px;z-index:40;width:44px;height:44px;border-radius:50%;border:1px solid rgba(242,200,101,.6);background:rgba(27,26,23,.78);color:#ffe9a0;font:400 24px/1 Georgia,serif;cursor:pointer;padding:0';
  let armed = 0; for (const ev of ['pointerdown', 'touchstart', 'mousedown']) b.addEventListener(ev, e => e.stopPropagation());
  b.addEventListener('click', async e => { e.stopPropagation(); if (Date.now() - armed > 3500) { armed = Date.now(); b.textContent = 'Map?'; b.style.width = '64px'; b.style.fontSize = '15px'; setTimeout(() => { if (Date.now() - armed >= 3400) { b.textContent = '⌂'; b.style.width = '44px'; b.style.fontSize = '24px'; } }, 3500); return; }
    b.textContent = '…'; await Promise.race([push(), new Promise(r => setTimeout(r, 1800))]); location.href = new URL('../index.html', import.meta.url).href; });
  document.body.appendChild(b);
}, 1500);
