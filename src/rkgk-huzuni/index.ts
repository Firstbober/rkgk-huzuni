import './meta.js?userscript-metadata';

import { rightPanel, topPanel } from './modules/panels';
import { scriptManager } from './modules/script-manager';
import { rkgkInternals } from './modules/rkgk-internals';
import { artworkProtocol } from './modules/artwork-protocol';

import HuzuniOverlay from './scripts/huzuni-overlay';
import ArtworkHangover from './scripts/artwork-hangover';
import { huzuniUI } from './modules/huzuni-ui';

//
// BEFORE DOM IS LOADED
//

const indexHijackPromise = rkgkInternals.insertNewIndex();

// Create namespace for further use
globalThis.huzuni = {};

console.log(
  `%chuzuni by Firstbober!`,
  'color: lightblue; font-size: x-large; font-weight: bold;',
);

// Disables index from loading, so we can
// modify it and extract what we need.
// rkgkInternals.disableIndex();

//
// AFTER DOM IS LOADED
//

async function selfTest() {
  const results = {
    rkgkInternals: await rkgkInternals.test(),

    topPanel: topPanel.test(),
    rightPanel: rightPanel.test(),
    scriptManager: scriptManager.test(),

    artworkProtocol: artworkProtocol.test(),
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
    await indexHijackPromise;

    if (
      [await selfTest()].reduce((prev, curr) => {
        console.error(
          `[huzuni] some of the self tests failed, disabling huzuni`,
        );
        return prev && curr;
      })
    ) {
      console.log(`[huzuni] all self tests passed!`);

      huzuniUI.setupCSS();
      artworkProtocol.setupListeners();

      scriptManager.registerScript('Artwork Hangover', new ArtworkHangover());
      // Always must be last
      scriptManager.registerScript(
        'Huzuni Overlay',
        new HuzuniOverlay(),
        false,
      );
    }
  })();
});
