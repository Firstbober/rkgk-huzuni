import './meta.js?userscript-metadata';
import uiCSS from './ui.css';

import { rightPanel, topPanel } from './modules/panels';
import { scriptManager } from './modules/script-manager';

import HuzuniOverlay from './scripts/huzuni-overlay';

console.log(
  `%chuzuni by Firstbober!`,
  'color: lightblue; font-size: x-large; font-weight: bold;',
);

function selfTest() {
  const results = {
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

if (
  [selfTest()].reduce((prev, curr) => {
    console.error(`[huzuni] some of the self tests failed, disabling huzuni`);
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

  rightPanel.start();
  scriptManager.registerScript('Huzuni Overlay', new HuzuniOverlay());
}

// globalThis.huzuni = {
//   unstable: {
//     topPanel,
//     rightPanel,
//   },
//   rkgk: {
//     handleRkGkImports: async (
//       body,
//       name: string,
//       path: string,
//       imported: boolean,
//     ) => {
//       if (imported) {
//         globalThis.huzuni.rkgk[name] = body;
//         return;
//       }
//       await import(`${path}`).then(
//         async (i) =>
//           await globalThis.huzuni.rkgk.handleRkGkImports(i, name, path, true),
//       );
//     },
//   },
// };

// async function huzuniStartupImportsAndHijack() {
//   await globalThis.huzuni.rkgk.handleRkGkImports(
//     null,
//     'wall',
//     './static/wall.js',
//     false,
//   );
//   await globalThis.huzuni.rkgk.handleRkGkImports(
//     null,
//     'session',
//     './static/session.js',
//     false,
//   );
//   await globalThis.huzuni.rkgk.handleRkGkImports(
//     null,
//     'framework',
//     './static/framework.js',
//     false,
//   );

//   // // Disable index.js
//   // for(const script of document.scripts) {
//   //   if(script.src.includes('static/index.js')) {
//   //     script.addEventListener('beforescriptexecute', async (event) => {
//   //       console.warn("[huzuni] disabling index.js")
//   //       event.preventDefault()
//   //     })
//   //   }
//   // }

//   // // Hijack and modify index.js
//   // {
//   //   console.warn('[huzuni] hijacking index.js');
//   //   const code = await (await fetch('static/index.js')).text();

//   //   let gatekeeper = true
//   //   let newCode = '';
//   //   for(const line of code.split('\n')) {
//   //     if(line.startsWith("const updateInterval = 1000 / 60;")) {
//   //       gatekeeper = false;
//   //     }

//   //     if(gatekeeper) continue
//   //     newCode += line;
//   //   }

//   //   globalThis.huzuni.rkgk.index = {};

//   //   eval(`
//   //     const Wall = huzuni.rkgk.wall.Wall;

//   //     const getLoginSecret = huzuni.rkgk.session.getLoginSecret;
//   //     const getUserId = huzuni.rkgk.session.getUserId;
//   //     const isUserLoggedIn = huzuni.rkgk.session.isUserLoggedIn;
//   //     const newSession = huzuni.rkgk.session.newSession;
//   //     const registerUser = huzuni.rkgk.session.registerUser;
//   //     const waitForLogin = huzuni.rkgk.session.waitForLogin;

//   //     const debounce = huzuni.rkgk.framework.debounce;
//   //     const ReticleCursor = huzuni.rkgk.reticle_renderer.ReticleCursor;
//   //   `+ newCode);
//   // }
// }

// huzuniStartupImportsAndHijack();
// huzuniStartupPlugins();
