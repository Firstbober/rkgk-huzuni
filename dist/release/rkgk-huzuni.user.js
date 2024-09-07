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

class TopPanel {
  test() {
    return this.getPanelElement() != undefined;
  }
  getPanelElement() {
    return document.querySelectorAll('#panels-overlay .rkgk-panel')[0];
  }

  // Appends HTML element at the start of the panel
  appendStart(element, href) {
    const panelElement = this.getPanelElement();
    const a = document.createElement('a');
    a.appendChild(element);
    if (href) a.href = href;
    panelElement.insertBefore(document.createElement('hr'), panelElement.firstChild);
    panelElement.insertBefore(a, panelElement.firstChild);
  }

  // Appends HTML element at the end of the panel
  appendEnd(element, href) {
    const panelElement = this.getPanelElement();
    const a = new HTMLAnchorElement();
    a.appendChild(element);
    if (href) a.href = href;
    panelElement.appendChild(document.createElement('hr'));
    panelElement.appendChild(element);
  }
}
class RightPanel {
  test() {
    if (this.getPanelElement() == undefined) return false;
    this.getPanelElement().style['flexWrap'] = 'wrap';
    return true;
  }
  getPanelElement() {
    return document.querySelectorAll('div#panels-overlay.panels.fullscreen div.right')[0];
  }
  getBrushEditorElement() {
    return document.querySelectorAll('rkgk-brush-editor.rkgk-panel')[0];
  }
  getCodeEditor() {
    return document.querySelectorAll('rkgk-brush-editor.rkgk-panel > rkgk-code-editor')[0];
  }
  appendEnd(element) {
    const panel = this.getPanelElement();
    element.style['marginLeft'] += '16px';
    element.style['width'] += '100%';
    element.style['marginTop'] += '8px';
    element.classList.add('rkgk-panel');
    panel.appendChild(element);
  }
}
const topPanel = new TopPanel();
const rightPanel = new RightPanel();

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

class RkGkInternals {
  constructor() {
    this.session = {};
    this.currentUserId = 0;
    this.events = new Proxy({
      wall() {},
      userJoined() {},
      userLeft() {}
    }, new MixinHandler());
  }
  async handleRkGkImports(body, name, path, imported) {
    if (imported) {
      console.info(`[huzuni] [rkgk-internals] imported "rkgk_${name}"!`);
      globalThis['rkgk_' + name] = body;
      return;
    }
    console.info(`[huzuni] [rkgk-internals] importing module "rkgk_${name}" with path "${path}"...`);
    try {
      const body = await import(`${path}`);
      await this.handleRkGkImports(body, name, path, true);
      return true;
    } catch (error) {
      console.error(`[huzuni] [rkgk-internals] importing module "rkgk_${name}" with path "${path}" failed!`);
      return false;
    }
  }
  async importRkgkInternals() {
    let result = true;
    result && (result = await this.handleRkGkImports(null, 'wall', 'rkgk/wall.js', false));
    result && (result = await this.handleRkGkImports(null, 'session', 'rkgk/session.js', false));
    result && (result = await this.handleRkGkImports(null, 'framework', 'rkgk/framework.js', false));
    result && (result = await this.handleRkGkImports(null, 'reticle_renderer', 'rkgk/reticle-renderer.js', false));
    result && (result = await this.handleRkGkImports(null, 'code_editor', 'rkgk/code-editor.js', false));
    return result;
  }
  insertNewIndex() {
    return new Promise(resolve => {
      const oldQuerySelector = document.querySelector;
      document.querySelector = value => {
        if (value != 'main') return oldQuerySelector.apply(document, [value]);
        setTimeout(async () => {
          document.querySelector = oldQuerySelector;
          await this.importRkgkInternals();
          resolve();
          await this.hijackIndex();
        }, 1);
        throw Error('[huzuni] got em');
      };
    });
  }
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
    const js_loading = document.createElement('div');
    js_loading.id = 'js-loading';
    document.body.appendChild(js_loading);
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
        this.session = await rkgk_session.newSession(values);
        this.setupListeners();
        return this.session;
      }
    };
    eval(newCode);
    return true;
  }
  async test() {
    return true;
  }
  setupListeners() {
    this.session.addEventListener('wallEvent', ev => {
      this.events.wall(ev['wallEvent']);
    });
    this.events.wall = wallEvent => {
      // Update Session object
      if (wallEvent.kind.event == 'join') {
        this.session.wallInfo.online.push({
          sessionId: wallEvent.sessionId,
          brush: wallEvent.kind.init.brush,
          nickname: wallEvent.kind.nickname
        });
        this.events.userJoined(wallEvent.sessionId, wallEvent.kind.nickname);
      } else if (wallEvent.kind.event == 'leave') {
        for (let i = 0; i < this.session.wallInfo.online.length; i++) {
          const user = this.session.wallInfo.online[i];
          if (user.sessionId == wallEvent.sessionId) {
            this.session.wallInfo.online.splice(i, 1);
            this.events.userLeft(wallEvent.sessionId, user.nickname);
          }
        }
      }
    };
  }
  sendSetBrush(brush) {
    this.session.sendSetBrush(brush);
  }
  getUsernameBySessionId(sessionId) {
    for (const user of this.session.wallInfo.online) {
      if (user.sessionId == sessionId) return user.nickname;
    }
    return undefined;
  }
}
const rkgkInternals = new RkGkInternals();

function base64ToBytes(base64) {
  const binString = atob(base64);
  return Uint8Array.from(binString, m => m.codePointAt(0));
}
function bytesToBase64(bytes) {
  const binString = Array.from(bytes, byte => String.fromCodePoint(byte)).join('');
  return btoa(binString);
}
class ArtworkProtocol {
  constructor() {
    this.ARTWORK_MESSAGE_PREFIX = '-- ARTWORK ';
    this.events = new Proxy({
      message() {}
    }, new MixinHandler());
  }
  test() {
    return document.querySelector('rkgk-brush-editor') != undefined;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  encodeArtworkMessage(message) {
    const encoded = bytesToBase64(new TextEncoder().encode(JSON.stringify(message)));
    return encoded;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  decodeArtworkMessage(message) {
    return JSON.parse(new TextDecoder().decode(base64ToBytes(message)));
  }
  setupListeners() {
    console.log(`[huzuni] [artwork-protocol] setting up listeners`);
    rkgkInternals.events.wall = wallEvent => {
      if (wallEvent.kind.event != 'setBrush') return;
      const brush = wallEvent.kind.brush;
      if (!brush.startsWith(this.ARTWORK_MESSAGE_PREFIX)) return;
      const message = this.decodeArtworkMessage(brush.slice(this.ARTWORK_MESSAGE_PREFIX.length));
      this.events.message(wallEvent.sessionId, message);
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sendBroadcastMessage(data) {
    const currentCode = document.querySelector('rkgk-brush-editor').code;
    rkgkInternals.sendSetBrush(`${this.ARTWORK_MESSAGE_PREFIX}${this.encodeArtworkMessage(data)}`);
    rkgkInternals.sendSetBrush(currentCode);
  }
}
const artworkProtocol = new ArtworkProtocol();

var css_248z$1 = ".huzuni-ui-tabs{border:1px solid var(--color-panel-border);display:flex;flex-direction:column}.huzuni-ui-tabs>div:first-child{border-bottom:1px solid var(--color-panel-border);display:flex}.huzuni-ui-tabs>div:first-child span{cursor:pointer;padding:4px 6px}.huzuni-ui-tabs>div:first-child span:hover{background-color:var(--color-shaded-background)}.huzuni-ui-tabs>div:first-child span.active{background-color:var(--color-panel-border)}";

var css_248z = "button{cursor:pointer}button:hover{background-color:var(--color-shaded-background)}button:disabled{opacity:.5}";

class HuzuniUI {
  setupCSS() {
    const style = document.createElement('style');
    style.textContent = [css_248z$1, css_248z].join('\n');
    document.body.appendChild(style);
  }
  tabs(labels, content) {
    const uiTabs = document.createElement('div');
    uiTabs.classList.add('huzuni-ui-tabs');
    const uiTabsButtonsContainer = document.createElement('div');
    uiTabsButtonsContainer.classList.add('huzuni-ui-tabs-labels');
    for (const label of labels) {
      const span = document.createElement('span');
      span.innerText = label;
      uiTabsButtonsContainer.appendChild(span);
    }
    uiTabs.appendChild(uiTabsButtonsContainer);
    const uiTabsContainer = document.createElement('div');
    uiTabsContainer.classList.add('huzuni-ui-tabs-container');
    uiTabsContainer.append(...content.map(e => {
      const d = document.createElement('div');
      d.appendChild(e);
      return d;
    }));
    uiTabs.appendChild(uiTabsContainer);
    const uiTabsButtons = uiTabs.querySelectorAll('.huzuni-ui-tabs-labels>span');
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
}
const huzuniUI = new HuzuniUI();

class HuzuniAPI {
  constructor() {
    this.enabled = false;
    this.topPanel = topPanel;
    this.rightPanel = rightPanel;
    this.huzuniUI = huzuniUI;
    this.rkgkInternals = rkgkInternals;
    this.artworkProtocol = artworkProtocol;
    this.scriptManager = scriptManager;
  }
}

let ScriptManager$1 = class ScriptManager {
  constructor() {
    this.scripts = new Map();
  }
  test() {
    return true;
  }
  registerScript(name, description, script, canBeDisabled = true) {
    if (this.scripts.has(name)) {
      console.error(`[huzuni] [script-manager] cannot load another script with name "${name}"`);
      return false;
    }
    console.log(`[huzuni] [script-manager] registered new script "${name}"`);
    this.scripts.set(name, {
      description,
      script,
      enabled: false,
      canBeDisabled
    });
    if (localStorage.getItem(`huzuni.internal-script.${name}.disabled`) == undefined) this.enableScript(name);
    return true;
  }
  enableScript(name) {
    if (!this.scripts.has(name)) {
      console.warn(`[huzuni] [script-manager] cannot enable non-existent script "${name}"`);
      return;
    }
    console.log(`[huzuni] [script-manager] enabled script "${name}"`);
    const api = new HuzuniAPI();
    api.enabled = true;
    this.scripts.get(name).apiInstance = api;
    this.scripts.get(name).enabled = true;
    this.scripts.get(name).script.start(api);
  }
  disableScript(name) {
    if (!this.scripts.has(name)) {
      console.warn(`[huzuni] [script-manager] cannot disable non-existent script "${name}"`);
      return;
    }
    console.log(`[huzuni] [script-manager] disabled script "${name}"`);
    this.scripts.get(name).apiInstance.enabled = false;
    this.scripts.get(name).enabled = false;
    this.scripts.get(name).script.stop();
  }
};
const scriptManager = new ScriptManager$1();

/*
// ==Huzuni Script==
// @name Keylogger
// @author Firstbober
// @description Keylogger for your keyboard
// ==Huzuni Script==

class Something {
  start(api) {
    api.artworkProtocol.events.message = (sessionId, json) => {
      console.log(`Something got artwork messsge with sid ${sessionId} and data ${json}`);
    }
  }
  stop() {
  }
}

return Something;
*/

class ScriptManager {
  constructor(api) {
    this.loadedIds = [];
    this.storageKeys = {
      code: 'huzuni-overlay.script-manager.code',
      scripts: 'huzuni-overlay.script-manager.scripts'
    };
    this.api = api;
    this.setupScriptManagerUI();
    this.checkScriptStorage();
  }
  getScriptMetadata(code) {
    let splitted = code.split('==Huzuni Script==');
    if (splitted.length < 3) return {
      errors: ['metadata is missing']
    };
    const metadata = {
      name: null,
      author: null,
      description: null
    };
    splitted = splitted[1].split('//');
    for (let i = 1; i < splitted.length - 1; i++) {
      const element = splitted[i].trim();
      if (element.startsWith('@name ')) {
        metadata.name = element.slice('@name '.length);
      }
      if (element.startsWith('@author ')) {
        metadata.author = element.slice('@author '.length);
      }
      if (element.startsWith('@description ')) {
        metadata.description = element.slice('@description '.length);
      }
    }
    const errors = [];
    if (metadata.name == null) errors.push('name is missing from metadata');
    if (metadata.author == null) errors.push('author is missing from metadata');
    if (metadata.description == null) errors.push('description is missing from metadata');
    if (errors.length > 0) return {
      errors
    };
    return {
      errors: [],
      metadata
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getScriptsStore() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let scriptsStore = localStorage.getItem(this.storageKeys.scripts);
    if (scriptsStore == undefined) {
      localStorage.setItem(this.storageKeys.scripts, JSON.stringify({}));
      scriptsStore = {};
    } else {
      scriptsStore = JSON.parse(scriptsStore);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return scriptsStore;
  }
  getScriptListElement(name, description, author) {
    const root = document.createElement('div');
    root.style.display = 'flex';
    root.style.width = '100%';
    root.style.justifyContent = 'space-between';
    root.style.padding = '4px';
    root.style.boxSizing = 'border-box';
    root.innerHTML = `
      <div style="display: flex; flex-direction: column;">
        <span style="font-weight: bold;">${name}</span>
        <span style="font-size: smaller;">${description} ; made by ${author}</span>
      </div>
      <div style="display: flex">
        <input type="checkbox" style="margin-right: 8px" class="disable" />
        <button style="background-color: var(--color-error); color: white;" class="delete">DELETE</button>
      </div>
    `;
    return root;
  }
  checkScriptStorage() {
    const store = this.getScriptsStore();
    const difference = Object.keys(store).sort().filter(x => !this.loadedIds.includes(x));
    for (const id of difference) {
      const script = store[id];
      if (!script.enabled) continue;
      console.log(`[huzuni-overlay] loading script "${script.metadata.name}" by "${script.metadata.author}"...`);
      try {
        store[id].enabled = this.api.scriptManager.registerScript(id, store[id].metadata.description, new (new Function(script.code)())());
      } catch (error) {
        console.error(`[huzuni-overlay] [${id}] fatal error:`, error);
        continue;
      }
      console.log(`[huzuni-overlay] loaded!`);
    }
    localStorage.setItem(this.storageKeys.scripts, JSON.stringify(store));
    for (const id of Object.keys(store)) {
      const script = store[id];
      const node = this.getScriptListElement(script.metadata.name, script.metadata.description, script.metadata.author);
      node.querySelector('.delete').addEventListener('click', () => {
        this.removeScript(id);
        node.remove();
      });
      node.querySelector('.disable').checked = store[id].enabled;
      node.querySelector('.disable').addEventListener('change', () => {
        if (node.querySelector('.disable').checked) {
          if (store[id].enabled) return;
          this.enableScript(id);
        } else {
          this.disableScript(id);
        }
      });
      this.scriptListNode.appendChild(node);
    }
  }
  addScript(metadata, code) {
    const scriptsStore = this.getScriptsStore();
    const getScriptId = `${metadata.name}.${metadata.author}`;
    if (scriptsStore[getScriptId] != undefined) {
      return false;
    }
    scriptsStore[getScriptId] = {
      metadata,
      code,
      enabled: true
    };
    localStorage.setItem(this.storageKeys.scripts, JSON.stringify(scriptsStore));
    return true;
  }
  removeScript(id) {
    this.disableScript(id);
    const store = this.getScriptsStore();
    delete store[id];
    localStorage.setItem(this.storageKeys.scripts, JSON.stringify(store));
  }
  enableScript(id) {
    const store = this.getScriptsStore();
    store[id].enabled = true;
    try {
      this.api.scriptManager.enableScript(id);
    } catch (error) {
      store[id].enabled = false;
      console.error(`[huzuni-overlay] [${id}] fatal error while enabling:`, error);
    }
    localStorage.setItem(this.storageKeys.scripts, JSON.stringify(store));
    return true;
  }
  disableScript(id) {
    const store = this.getScriptsStore();
    store[id].enabled = false;
    this.api.scriptManager.disableScript(id);
    localStorage.setItem(this.storageKeys.scripts, JSON.stringify(store));
  }
  createCodeEditor() {
    const root = document.createElement('div');

    // Editor
    const rkgkCodeEditor = new rkgk_code_editor.CodeEditor([]);
    root.appendChild(rkgkCodeEditor);
    root.style['marginTop'] = '6px';
    rkgkCodeEditor.addEventListener('.codeChanged', () => {
      localStorage.setItem(this.storageKeys.code, rkgkCodeEditor.code);
    });

    // Error listing
    const errors = document.createElement('pre');
    errors.style['color'] = 'var(--color-error)';
    errors.style['whiteSpace'] = 'pre-wrap';
    errors.style['marginLeft'] = '16px';
    root.appendChild(errors);

    // Operation buttons
    const buttons = document.createElement('div');
    buttons.style['paddingLeft'] = '6px';
    buttons.style['paddingBottom'] = '6px';
    buttons.innerHTML = `
      <button class="save">Save</button>
      <button class="clear" style="background-color: var(--color-error); color: white;">Clear</button>
    `;
    buttons.style['marginTop'] = '18px';
    root.appendChild(buttons);

    // Event handlers on buttons
    buttons.querySelector('.save').addEventListener('click', () => {
      errors.textContent = '';
      const metadata = this.getScriptMetadata(rkgkCodeEditor.code);
      if (metadata.errors.length > 0) {
        errors.textContent = metadata.errors.join('\n');
        return;
      }
      if (!this.addScript(metadata.metadata, rkgkCodeEditor.code)) {
        errors.textContent = `script with name "${metadata.metadata.name}" and author "${metadata.metadata.author}" is already there`;
        return;
      }
      rkgkCodeEditor.setCode('');
      errors.textContent = 'added script!';
      this.checkScriptStorage();
    });
    buttons.querySelector('.clear').addEventListener('click', () => {
      rkgkCodeEditor.setCode('');
    });

    // Finalize
    return {
      root,
      finish: () => {
        if (localStorage.getItem(this.storageKeys.code)) {
          rkgkCodeEditor.setCode(localStorage.getItem(this.storageKeys.code));
        }
      }
    };
  }
  setupScriptManagerUI() {
    const scriptManagerUI = document.createElement('div');
    scriptManagerUI.style['padding'] = '8px';
    scriptManagerUI.innerHTML = `
      <span style="font-size: medium;">Script Manager</span>
    `;
    const codeEditor = this.createCodeEditor();
    this.scriptListNode = document.createElement('div');
    this.scriptListNode.style.display = 'flex';
    this.scriptListNode.style.flexDirection = 'column';
    this.scriptListNode.style.maxHeight = '300px';
    this.scriptListNode.style.overflowY = 'auto';
    this.scriptListNode.style.width = '100%';
    this.scriptListNode.style.boxSizing = 'border-box';
    for (const script of scriptManager.scripts) {
      const node = this.getScriptListElement(script[0], script[1].description, 'huzuni');
      node.querySelector('.delete').remove();
      node.querySelector('.disable').checked = script[1].enabled;
      node.querySelector('.disable').addEventListener('change', () => {
        if (node.querySelector('.disable').checked) {
          localStorage.removeItem(`huzuni.internal-script.${script[0]}.disabled`);
          this.api.scriptManager.enableScript(script[0]);
        } else {
          localStorage.setItem(`huzuni.internal-script.${script[0]}.disabled`, 'yes');
          this.api.scriptManager.disableScript(script[0]);
        }
      });
      if (!script[1].canBeDisabled) node.querySelector('.disable').disabled = true;
      this.scriptListNode.appendChild(node);
    }
    scriptManagerUI.appendChild(this.api.huzuniUI.tabs(['Code Editor', 'Script List'], [codeEditor.root, this.scriptListNode]));
    this.api.rightPanel.appendEnd(scriptManagerUI);
    codeEditor.finish();
  }
}
class HuzuniOverlay {
  constructor() {
    this.storageKeys = {};
  }
  setupHuzuniMenuBar() {
    const huzuniButton = document.createElement('div');
    huzuniButton.innerHTML = `
      <img src="https://raw.githubusercontent.com/Firstbober/rkgk-huzuni/master/static/logo.png" width="16" height="16"
        style="margin-right: 4px;" />
      <span>huzuni</span>
    `;
    huzuniButton.style['display'] = 'flex';
    this.api.topPanel.appendStart(huzuniButton, 'https://github.com/Firstbober/rkgk-huzuni');
    huzuniButton.parentElement.style['paddingLeft'] = '4px';
    huzuniButton.parentElement.style['paddingRight'] = '4px';
  }
  start(api) {
    this.api = api;
    this.setupHuzuniMenuBar();
    this.scriptManager = new ScriptManager(api);
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
        api.artworkProtocol.sendBroadcastMessage({
          type: 'chatMessage',
          message: messageText
        });
        textarea.value = '';
      }
    });
    chat.appendChild(textarea);
    const addMessage = (content, system = false) => {
      const message = document.createElement('span');
      message.innerText = content;
      message.style['borderBottom'] = '1px solid var(--color-panel-border)';
      message.style['opacity'] = system ? '0.5' : '1.0';
      messageList.appendChild(message);
      messageList.scrollTo({
        top: messageList.scrollHeight
      });
    };

    // Handle artwork messages
    api.artworkProtocol.events.message = (sessionId, json) => {
      if (!api.enabled) return;
      if (json.type != 'chatMessage') return;
      addMessage(`<${rkgkInternals.getUsernameBySessionId(sessionId)}>: ${json.message}`);
    };

    // User joined/left
    api.rkgkInternals.events.userJoined = (sid, nickname) => {
      if (!api.enabled) return;
      addMessage(`User <${nickname}> joined!`, true);
    };
    api.rkgkInternals.events.userLeft = (sid, nickname) => {
      if (!api.enabled) return;
      addMessage(`User <${nickname}> left!`, true);
    };
    this.chatElement = chat;
    document.getElementsByTagName('main')[0].appendChild(chat);
  }
  stop() {
    this.chatElement.remove();
  }
}

class BrushList {
  constructor() {
    this.brushes = new Map();
    this.reservedBrushes = ['last-session', 'default-1'];
  }
  addBrush() {
    const ids = [];
    for (const option of this.brushList.options) {
      ids.push(option.value);
    }
    let brushId = `New Brush`;
    let iteration = 1;
    while (ids.includes(brushId)) {
      brushId = `New Brush ${iteration}`;
      iteration += 1;
    }
    const option = document.createElement('option');
    option.value = brushId;
    option.text = brushId;
    this.brushList.options.add(option);
    this.brushList.value = brushId;
    this.removeButton.disabled = false;
    this.brushes.set(brushId, {
      name: brushId,
      code: ''
    });
  }
  removeBrush(name) {
    this.brushes.delete(name);
    localStorage.setItem('huzuni.brush-list.brushes', JSON.stringify(Object.fromEntries(this.brushes)));
  }
  getBrush(name) {
    return this.brushes.get(name).code;
  }
  changeBrush(name, code) {
    if (this.reservedBrushes.includes(name)) return;
    if (code.length > 0) {
      if (code[0] == '-') {
        let accumulatedText = '';
        for (const char of code) {
          if (char == '\n') {
            break;
          }
          accumulatedText += char;
        }
        if (accumulatedText.startsWith('--')) {
          for (const option of this.brushList.options) {
            if (option.value != name) continue;
            const newName = accumulatedText.slice(2).trim();
            if (newName.length < 1) break;
            option.text = newName;
            this.brushes.set(name, {
              code,
              name: newName
            });
            localStorage.setItem('huzuni.brush-list.brushes', JSON.stringify(Object.fromEntries(this.brushes)));
            return;
          }
        }
      }
    }
    this.brushes.set(name, {
      code,
      name
    });
    localStorage.setItem('huzuni.brush-list.brushes', JSON.stringify(Object.fromEntries(this.brushes)));
  }
  start(api) {
    const rkgkCodeEditor = api.rightPanel.getCodeEditor();
    this.brushListRoot = document.createElement('div');
    this.brushListRoot.style.display = 'flex';
    this.brushListRoot.style.marginBottom = '12px';
    this.brushListRoot.innerHTML = `
      <select class="brush-list" style="width: 100%; outline: none; margin-right: 4px;">
        <option value="last-session">Last Session</option>
        <option value="default-1">Default 1</option>
      </select>
      <button style="white-space: nowrap; margin-right:4px" class="new">New</button>
      <button style="background-color:var(--color-error); color: white;" class="remove" disabled>Remove</button>
    `;
    this.brushList = this.brushListRoot.querySelector('.brush-list');
    const newButton = this.brushListRoot.querySelector('.new');
    this.removeButton = this.brushListRoot.querySelector('.remove');
    this.brushList.addEventListener('change', () => {
      const brushId = this.brushList.value;

      // Enable delete button
      this.removeButton.disabled = this.reservedBrushes.includes(brushId);
      if (brushId == 'last-session') {
        var _localStorage$getItem;
        rkgkCodeEditor.setCode((_localStorage$getItem = localStorage.getItem('rkgk.brushEditor.code')) != null ? _localStorage$getItem : ':) no brush saved');
        return;
      }
      if (brushId == 'default-1') {
        rkgkCodeEditor.setCode(`
-- This is your brush.
-- Try playing around with the numbers,
-- and see what happens!

stroke 8 #000 (vec 0 0)
`.trim());
        return;
      }
      rkgkCodeEditor.setCode(this.getBrush(brushId));
    });
    newButton.addEventListener('click', () => {
      this.addBrush();
      rkgkCodeEditor.setCode('');
    });
    this.removeButton.addEventListener('click', () => {
      for (const option of this.brushList.options) {
        if (option.value == this.brushList.value) {
          option.remove();
          this.removeButton.disabled = true;
          this.removeBrush(option.value);
        }
      }
    });
    rkgkCodeEditor.addEventListener('.codeChanged', () => {
      if (!api.enabled) return;
      if (this.reservedBrushes.includes(this.brushList.value)) return;
      this.changeBrush(this.brushList.value, rkgkCodeEditor.code);
    });
    const storageObject = localStorage.getItem('huzuni.brush-list.brushes');
    if (storageObject != null) {
      this.brushes = new Map(Object.entries(JSON.parse(storageObject)));
      for (const [name, brush] of this.brushes.entries()) {
        const option = document.createElement('option');
        option.text = brush.name;
        option.value = name;
        this.brushList.options.add(option);
      }
    }
    const brushEditorPanel = api.rightPanel.getBrushEditorElement();
    brushEditorPanel.insertBefore(this.brushListRoot, brushEditorPanel.firstChild);
  }
  stop() {
    this.brushListRoot.remove();
  }
}

//
// BEFORE DOM IS LOADED
//

const indexHijackPromise = rkgkInternals.insertNewIndex();

// Create namespace for further use
globalThis.huzuni = {};
console.log(`%chuzuni by Firstbober!`, 'color: lightblue; font-size: x-large; font-weight: bold;');

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
    artworkProtocol: artworkProtocol.test()
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
    await indexHijackPromise;
    if ([await selfTest()].reduce((prev, curr) => {
      console.error(`[huzuni] some of the self tests failed, disabling huzuni`);
      return prev && curr;
    })) {
      console.log(`[huzuni] all self tests passed!`);
      huzuniUI.setupCSS();
      artworkProtocol.setupListeners();
      try {
        scriptManager.registerScript('Artwork Hangover', 'Port of some of Artwork features', new ArtworkHangover());
        scriptManager.registerScript('Brush List', 'A brush list for your brush editor', new BrushList());
      } catch (error) {
        console.error(`[huzuni] Error while loading internal scripts:`, error);
      }

      // Always must be last
      scriptManager.registerScript('Huzuni Overlay', 'Huzuni user interface', new HuzuniOverlay(), false);
    }
  })();
});

})();
