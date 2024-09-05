import './meta.js?userscript-metadata';
import uiCSS from './ui.css';

import { rightPanel, topPanel } from './modules/panels';
import { scriptManager } from './modules/script-manager';

import HuzuniOverlay from './scripts/huzuni-overlay';
import ArtworkHangover from './scripts/artwork-hangover';
import { rkgkInternals } from './modules/rkgk-internals';

//
// BEFORE DOM IS LOADED
//

// Create namespace for further use
globalThis.huzuni = {};

console.log(
  `%chuzuni by Firstbober!`,
  'color: lightblue; font-size: x-large; font-weight: bold;',
);

// Disables index from loading, so we can
// modify it and extract what we need.
rkgkInternals.disableIndex();

//
// AFTER DOM IS LOADED
//

async function selfTest() {
  const results = {
    rkgkInternals: await rkgkInternals.test(),

    topPanel: topPanel.test(),
    rightPanel: rightPanel.test(),
    scriptManager: scriptManager.test(),
  };

  let canPass = true;
  for (const [key, value] of Object.entries(results)) {
    canPass &&= value;
    if (!value) {
      console.error(
        `[huzuni] module (${key}) didn't pass self test! RkGk might have gotten an update.`,
      );
      continue;
    }
    console.info(`[huzuni] [${key}] passed self test!`);
  }

  return canPass;
}

document.addEventListener('DOMContentLoaded', () => {
  (async () => {
    if (
      [await selfTest()].reduce((prev, curr) => {
        console.error(
          `[huzuni] some of the self tests failed, disabling huzuni`,
        );
        return prev && curr;
      })
    ) {
      console.log(`[huzuni] all self tests passed!`);

      // Add css
      {
        const uiCssStyle = document.createElement('style');
        uiCssStyle.innerHTML = uiCSS;
        document.head.appendChild(uiCssStyle);
      }

      scriptManager.registerScript('Huzuni Overlay', new HuzuniOverlay());
      scriptManager.registerScript('Artwork Hangover', new ArtworkHangover());
    }
  })();
});
