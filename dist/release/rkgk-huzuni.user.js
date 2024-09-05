// ==UserScript==
// @name        huzuni for rkgk
// @namespace   Violentmonkey Scripts
// @description A modification loader for rkgk
// @match       https://staging.rkgk.app/*
// @version     0.0.0
// @author      Firstbober
// @icon        https://raw.githubusercontent.com/Firstbober/rkgk-huzuni/master/static/logo.png
// @run-at      document-start
// @grant       none
// ==/UserScript==

(function () {
'use strict';

var css_248z = ".huzuni-ui-tabs{border:1px solid var(--color-panel-border)}.huzuni-ui-tabs>div:first-child{border-bottom:1px solid var(--color-panel-border)}.huzuni-ui-tabs>div:first-child span{cursor:pointer;padding:2px 6px}.huzuni-ui-tabs>div:first-child span:hover{background-color:var(--color-shaded-background)}.huzuni-ui-tabs>div:first-child span.active{background-color:var(--color-panel-border)}";

const topPanel = {
  getPanelElement() {
    return document.querySelectorAll('#panels-overlay .rkgk-panel')[0];
  },
  test() {
    return topPanel.getPanelElement() != undefined;
  },
  // Appends HTML element at the start of the panel
  appendStart(element, href) {
    const panelElement = topPanel.getPanelElement();
    const a = document.createElement('a');
    a.appendChild(element);
    if (href) a.href = href;
    panelElement.insertBefore(document.createElement('hr'), panelElement.firstChild);
    panelElement.insertBefore(a, panelElement.firstChild);
  },
  // Appends HTML element at the end of the panel
  appendEnd(element, href) {
    const panelElement = topPanel.getPanelElement();
    const a = new HTMLAnchorElement();
    a.appendChild(element);
    if (href) a.href = href;
    panelElement.appendChild(document.createElement('hr'));
    panelElement.appendChild(element);
  }
};
const rightPanel = {
  getPanelElement() {
    return document.querySelectorAll('div#panels-overlay.panels.fullscreen div.right')[0];
  },
  test() {
    if (rightPanel.getPanelElement() == undefined) return false;
    rightPanel.getPanelElement().style['flexWrap'] = 'wrap';
    return true;
  },
  appendEnd(element) {
    const panel = rightPanel.getPanelElement();
    element.style['marginLeft'] += '16px';
    element.style['width'] += '100%';
    element.style['marginTop'] += '8px';
    element.classList.add('rkgk-panel');
    panel.appendChild(element);
  }
};

const huzuniUI = {
  tabs(labels, content) {
    const uiTabs = document.createElement('div');
    uiTabs.classList.add('huzuni-ui-tabs');
    const uiTabsButtonsContainer = document.createElement('div');
    for (const label of labels) {
      const span = document.createElement('span');
      span.innerText = label;
      uiTabsButtonsContainer.appendChild(span);
    }
    uiTabs.appendChild(uiTabsButtonsContainer);
    const uiTabsContainer = document.createElement('div');
    uiTabsContainer.classList.add('huzuni-ui-tabs-container');
    uiTabsContainer.append(...content);
    uiTabs.appendChild(uiTabsContainer);
    const uiTabsButtons = uiTabs.querySelectorAll('div:first-child>span');
    const uiTabsContent = uiTabs.querySelectorAll('.huzuni-ui-tabs-container>*');
    for (let y = 0; y < uiTabsContent.length; y++) {
      if (y == 0) continue;
      uiTabsContent[y].style['display'] = 'none';
    }
    for (let i = 0; i < uiTabsButtons.length; i++) {
      uiTabsButtons[i].addEventListener('click', () => {
        for (let y = 0; y < uiTabsButtons.length; y++) {
          uiTabsButtons[y].classList.remove('active');
        }
        uiTabsButtons[i].classList.add('active');
        for (let y = 0; y < uiTabsContent.length; y++) {
          uiTabsContent[y].style['display'] = y == i ? 'flex' : 'none';
        }
      });
    }
    uiTabsButtons[0].classList.add('active');
    return uiTabs;
  }
};

class HuzuniAPI {
  constructor() {
    this.topPanel = topPanel;
    this.rightPanel = rightPanel;
    this.huzuniUI = huzuniUI;
  }
}

const scriptManager = {
  scripts: new Map(),
  test() {
    return true;
  },
  registerScript(name, script) {
    if (scriptManager.scripts.has(name)) {
      console.error(`[huzuni] [script-manager] cannot load another script with name "${name}"`);
      return;
    }
    console.log(`[huzuni] [script-manager] registered new script "${name}"`);
    scriptManager.scripts.set(name, script);
    scriptManager.enableScript(name);
  },
  enableScript(name) {
    if (!scriptManager.scripts.has(name)) {
      console.warn(`[huzuni] [script-manager] cannot enable non-existent script "${name}"`);
      return;
    }
    console.log(`[huzuni] [script-manager] enabled script "${name}"`);
    const api = new HuzuniAPI();
    scriptManager.scripts.get(name).start(api);
  },
  disableScript(name) {
    if (!scriptManager.scripts.has(name)) {
      console.warn(`[huzuni] [script-manager] cannot disable non-existent script "${name}"`);
      return;
    }
    console.log(`[huzuni] [script-manager] disabled script "${name}"`);
    scriptManager.scripts.get(name).stop();
  }
};

class HuzuniOverlay {
  setupScriptManagerUI() {
    const scriptManagerUI = document.createElement('div');
    scriptManagerUI.style['padding'] = '8px';
    scriptManagerUI.innerHTML = `
      <span style="font-size: medium;">Script Manager</span>
    `;
    const c1 = document.createElement('div');
    c1.innerText = 'Code Editor';
    const c2 = document.createElement('div');
    c2.innerText = 'Script List';
    scriptManagerUI.appendChild(this.api.huzuniUI.tabs(['Code Editor', 'Script List'], [c1, c2]));
    this.api.rightPanel.appendEnd(scriptManagerUI);
  }
  setupHuzuniMenuBar() {
    const text = document.createElement('span');
    text.innerText = 'huzuni';
    this.api.topPanel.appendStart(text, 'https://github.com/Firstbober/rkgk-huzuni');
    const img = document.createElement('img');
    img.src = 'https://raw.githubusercontent.com/Firstbober/rkgk-huzuni/master/static/logo.png';
    img.style['width'] = '16px';
    img.style['height'] = '16px';
    this.api.topPanel.appendStart(img, 'https://github.com/Firstbober/rkgk-huzuni');
    img.parentElement.style['paddingLeft'] = '4px';
    img.parentElement.style['paddingRight'] = '4px';
  }
  start(api) {
    this.api = api;
    this.setupHuzuniMenuBar();
    this.setupScriptManagerUI();
  }
  stop() {}
}

class ArtworkHangover {
  start(api) {
    this.api = api;

    // Chat window
    const chat = document.createElement('div');
    chat.style['display'] = 'flex';
    chat.style['position'] = 'absolute';
    chat.style['left'] = '0';
    chat.style['bottom'] = '0';
    chat.style['height'] = 'fit-content';
    chat.style['margin-left'] = '16px';
    chat.style['margin-bottom'] = '16px';
    chat.style['padding'] = '4px';
    chat.style['flexDirection'] = 'column';
    chat.classList.add('rkgk-panel');

    // Chat message list
    const messageList = document.createElement('div');
    messageList.style['display'] = 'flex';
    messageList.style['flexDirection'] = 'column';
    messageList.style['maxHeight'] = '300px';
    messageList.style['marginBottom'] = '6px';
    messageList.style['overflowY'] = 'scroll';
    chat.appendChild(messageList);

    // Chat editor field
    const textarea = document.createElement('textarea');
    textarea.rows = 1;
    textarea.cols = 30;
    textarea.addEventListener('keyup', ev => {
      if (ev.key == 'Enter') {
        const messageText = textarea.value.trim();
        if (messageText.length == 0) return;
        const message = document.createElement('span');
        message.innerText = `<you>: ${messageText}`;
        message.style['borderBottom'] = '1px solid var(--color-panel-border)';
        messageList.appendChild(message);
        messageList.scrollTo({
          top: messageList.scrollHeight
        });
        textarea.value = '';
      }
    });
    chat.appendChild(textarea);
    document.getElementsByTagName('main')[0].appendChild(chat);
  }
  stop() {}
}

class MixinHandler {
  constructor() {
    this.mixins = new Map();
  }
  set(target, prop, value) {
    if (typeof value !== 'function') {
      console.error("[huzuni] can't set mixin with value different than function");
      return false;
    }
    if (!this.mixins.has(prop)) {
      this.mixins.set(prop, []);
    }
    this.mixins.get(prop).push(value);
    console.debug(`[huzuni] registered mixin for`, prop);
    return true;
  }
  get(target, p) {
    if (typeof target[p] === 'function') {
      return new Proxy(target[p], {
        apply: (targetFn, thisArg, argumentsList) => {
          if (!this.mixins.get(p)) {
            return Reflect.apply(targetFn, thisArg, argumentsList);
          }
          for (const mixs of this.mixins.get(p)) {
            mixs.apply(target, argumentsList);
          }
          return Reflect.apply(targetFn, thisArg, argumentsList);
        }
      });
    } else {
      return Reflect.get(target, p);
    }
  }
}

const rkgkInternals = {
  session: {},
  async handleRkGkImports(body, name, path, imported) {
    if (imported) {
      console.info(`[huzuni] [rkgk-internals] imported "rkgk_${name}"!`);
      globalThis['rkgk_' + name] = body;
      return;
    }
    console.info(`[huzuni] [rkgk-internals] importing module "rkgk_${name}" with path "${path}"...`);
    try {
      const body = await import(`${path}`);
      rkgkInternals.handleRkGkImports(body, name, path, true);
      return true;
    } catch (error) {
      console.error(`[huzuni] [rkgk-internals] importing module "rkgk_${name}" with path "${path}" failed!`);
      return false;
    }
  },
  async importRkgkInternals() {
    let result = true;
    result && (result = await rkgkInternals.handleRkGkImports(null, 'wall', 'rkgk/wall.js', false));
    result && (result = await rkgkInternals.handleRkGkImports(null, 'session', 'rkgk/session.js', false));
    result && (result = await rkgkInternals.handleRkGkImports(null, 'framework', 'rkgk/framework.js', false));
    result && (result = await rkgkInternals.handleRkGkImports(null, 'reticle_renderer', 'rkgk/reticle-renderer.js', false));
    return result;
  },
  async disableIndex() {
    window.addEventListener('beforescriptexecute', ev => {
      const script = ev.target;
      if (script.innerHTML.includes('import "rkgk/index.js";')) {
        const newScript = document.createElement('script');
        newScript.type = 'module';
        newScript.innerHTML = script.innerHTML.replaceAll('import "rkgk/index.js";', '');
        newScript.innerHTML += `;console.log('[huzuni] [rkgk-internals] hijacked head import section!');`;
        document.head.appendChild(newScript);
        ev.preventDefault();
        ev.stopPropagation();
        ev.stopImmediatePropagation();
      }
    });
  },
  async hijackIndex() {
    console.info('[huzuni] [rkgk-internals] starting hijacking of index.js...');
    const code = await (await fetch('static/index.js')).text();
    let gatekeeper = true;
    let newCode = '';
    for (const line of code.split('\n')) {
      if (line.startsWith('const updateInterval = 1000 / 60;')) {
        gatekeeper = false;
      }
      if (gatekeeper) continue;
      newCode += line + '\n';
    }
    console.info('[huzuni] [rkgk-internals] removing js-loading from index...');
    newCode = newCode.replaceAll(`document.getElementById('js-loading')`, '');
    newCode = `
      const Wall = rkgk_wall.Wall;

      const getLoginSecret = rkgk_session.getLoginSecret;
      const getUserId = rkgk_session.getUserId;
      const isUserLoggedIn = rkgk_session.isUserLoggedIn;
      const newSession = huzuni.rkgk_overrides.newSession;
      const registerUser = rkgk_session.registerUser;
      const waitForLogin = rkgk_session.waitForLogin;

      const debounce = rkgk_framework.debounce;
      const ReticleCursor = rkgk_reticle_renderer.ReticleCursor;
    ` + newCode;
    globalThis.huzuni.rkgk_overrides = {
      newSession: async values => {
        rkgkInternals.session = await rkgk_session.newSession(values);
        rkgkInternals.setupListeners();
        return rkgkInternals.session;
      }
    };
    eval(newCode);
    return true;
  },
  async test() {
    let result = true;
    result && (result = await rkgkInternals.importRkgkInternals());
    result && (result = await rkgkInternals.hijackIndex());
    return result;
  },
  setupListeners() {
    console.log(rkgkInternals.session);
    rkgkInternals.session.addEventListener('wallEvent', ev => {
      const event = ev['wallEvent'];
      rkgkInternals.events.wall(event.sessionId, event);
    });
  },
  events: new Proxy({
    wall() {}
  }, new MixinHandler())
};

//
// BEFORE DOM IS LOADED
//

// Create namespace for further use
globalThis.huzuni = {};
console.log(`%chuzuni by Firstbober!`, 'color: lightblue; font-size: x-large; font-weight: bold;');

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
    scriptManager: scriptManager.test()
  };
  let canPass = true;
  for (const [key, value] of Object.entries(results)) {
    canPass && (canPass = value);
    if (!value) {
      console.error(`[huzuni] module (${key}) didn't pass self test! RkGk might have gotten an update.`);
      continue;
    }
    console.info(`[huzuni] [${key}] passed self test!`);
  }
  return canPass;
}
document.addEventListener('DOMContentLoaded', () => {
  (async () => {
    if ([await selfTest()].reduce((prev, curr) => {
      console.error(`[huzuni] some of the self tests failed, disabling huzuni`);
      return prev && curr;
    })) {
      console.log(`[huzuni] all self tests passed!`);

      // Add css
      {
        const uiCssStyle = document.createElement('style');
        uiCssStyle.innerHTML = css_248z;
        document.head.appendChild(uiCssStyle);
      }
      scriptManager.registerScript('Huzuni Overlay', new HuzuniOverlay());
      scriptManager.registerScript('Artwork Hangover', new ArtworkHangover());
    }
  })();
});

})();
