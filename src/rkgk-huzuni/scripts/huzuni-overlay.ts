import { HuzuniAPI, HuzuniScript } from '../huzuni-api';
import { scriptManager as huzuni_scriptManager } from '../modules/script-manager';

interface ScriptMetadata {
  name: string;
  author: string;
  description: string;
}

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
  api: HuzuniAPI;
  loadedIds: string[] = [];

  scriptListNode: HTMLDivElement;

  storageKeys = {
    code: 'huzuni-overlay.script-manager.code',
    scripts: 'huzuni-overlay.script-manager.scripts',
  };

  constructor(api: HuzuniAPI) {
    this.api = api;

    this.setupScriptManagerUI();
    this.checkScriptStorage();
  }

  getScriptMetadata(code: string): {
    errors: string[];
    metadata?: ScriptMetadata;
  } {
    let splitted = code.split('==Huzuni Script==');
    if (splitted.length < 3)
      return {
        errors: ['metadata is missing'],
      };

    const metadata: ScriptMetadata = {
      name: null,
      author: null,
      description: null,
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

    const errors: string[] = [];

    if (metadata.name == null) errors.push('name is missing from metadata');
    if (metadata.author == null) errors.push('author is missing from metadata');
    if (metadata.description == null)
      errors.push('description is missing from metadata');

    if (errors.length > 0)
      return {
        errors,
      };

    return {
      errors: [],
      metadata,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getScriptsStore(): {
    [index: string]: {
      metadata: ScriptMetadata;
      code: string;
      enabled: boolean;
    };
  } {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let scriptsStore: string | { [index: string]: any } = localStorage.getItem(
      this.storageKeys.scripts,
    );
    if (scriptsStore == undefined) {
      localStorage.setItem(this.storageKeys.scripts, JSON.stringify({}));
      scriptsStore = {};
    } else {
      scriptsStore = JSON.parse(scriptsStore);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return scriptsStore as any;
  }

  getScriptListElement(
    name: string,
    description: string,
    author: string,
  ): HTMLDivElement {
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
    const difference = Object.keys(store)
      .sort()
      .filter((x) => !this.loadedIds.includes(x));

    for (const id of difference) {
      const script = store[id];
      if (!script.enabled) continue;

      console.log(
        `[huzuni-overlay] loading script "${script.metadata.name}" by "${script.metadata.author}"...`,
      );

      try {
        store[id].enabled = this.api.scriptManager.registerScript(
          id,
          new (new Function(script.code)())(),
        );
      } catch (error) {
        console.error(`[huzuni-overlay] [${id}] fatal error:`, error);
        continue;
      }
      console.log(`[huzuni-overlay] loaded!`);
    }

    localStorage.setItem(this.storageKeys.scripts, JSON.stringify(store));

    for (const id of Object.keys(store)) {
      const script = store[id];
      const node = this.getScriptListElement(
        script.metadata.name,
        script.metadata.description,
        script.metadata.author,
      );
      node.querySelector('.delete').addEventListener('click', () => {
        this.removeScript(id);
        node.remove();
      });
      (node.querySelector('.disable') as HTMLInputElement).checked =
        store[id].enabled;
      node.querySelector('.disable').addEventListener('change', () => {
        if ((node.querySelector('.disable') as HTMLInputElement).checked) {
          if (store[id].enabled) return;
          this.enableScript(id);
        } else {
          this.disableScript(id);
        }
      });
      this.scriptListNode.appendChild(node);
    }
  }

  addScript(metadata: ScriptMetadata, code: string): boolean {
    const scriptsStore = this.getScriptsStore();
    const getScriptId = `${metadata.name}.${metadata.author}`;

    if (scriptsStore[getScriptId] != undefined) {
      return false;
    }

    scriptsStore[getScriptId] = {
      metadata,
      code,
      enabled: true,
    };

    localStorage.setItem(
      this.storageKeys.scripts,
      JSON.stringify(scriptsStore),
    );
    return true;
  }

  removeScript(id: string) {
    this.disableScript(id);

    const store = this.getScriptsStore();
    delete store[id];

    localStorage.setItem(this.storageKeys.scripts, JSON.stringify(store));
  }

  enableScript(id: string): boolean {
    const store = this.getScriptsStore();
    store[id].enabled = true;

    try {
      this.api.scriptManager.enableScript(id);
    } catch (error) {
      store[id].enabled = false;
      console.error(
        `[huzuni-overlay] [${id}] fatal error while enabling:`,
        error,
      );
    }

    localStorage.setItem(this.storageKeys.scripts, JSON.stringify(store));

    return true;
  }
  disableScript(id: string) {
    const store = this.getScriptsStore();
    store[id].enabled = false;

    this.api.scriptManager.disableScript(id);

    localStorage.setItem(this.storageKeys.scripts, JSON.stringify(store));
  }

  createCodeEditor() {
    const root = document.createElement('div');

    // Editor
    const rkgkCodeEditor = new rkgk_code_editor.CodeEditor();
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

      if (!this.addScript(metadata.metadata!, rkgkCodeEditor.code)) {
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
      },
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

    for (const script of huzuni_scriptManager.scripts) {
      const node = this.getScriptListElement(
        script[0],
        'huzuni internal script',
        'huzuni',
      );
      node.querySelector('.delete').remove();
      (node.querySelector('.disable') as HTMLInputElement).checked =
        script[1].enabled;

      node.querySelector('.disable').addEventListener('change', () => {
        if ((node.querySelector('.disable') as HTMLInputElement).checked) {
          localStorage.removeItem(
            `huzuni.internal-script.${script[0]}.disabled`,
          );
          this.api.scriptManager.enableScript(script[0]);
        } else {
          localStorage.setItem(
            `huzuni.internal-script.${script[0]}.disabled`,
            'yes',
          );
          this.api.scriptManager.disableScript(script[0]);
        }
      });

      if (!script[1].canBeDisabled)
        (node.querySelector('.disable') as HTMLInputElement).disabled = true;

      this.scriptListNode.appendChild(node);
    }

    scriptManagerUI.appendChild(
      this.api.huzuniUI.tabs(
        ['Code Editor', 'Script List'],
        [codeEditor.root, this.scriptListNode],
      ),
    );

    this.api.rightPanel.appendEnd(scriptManagerUI);

    codeEditor.finish();
  }
}

export default class HuzuniOverlay implements HuzuniScript {
  api: HuzuniAPI;
  scriptManager: ScriptManager;

  storageKeys = {};

  setupHuzuniMenuBar() {
    const huzuniButton = document.createElement('div');
    huzuniButton.innerHTML = `
      <img src="https://raw.githubusercontent.com/Firstbober/rkgk-huzuni/master/static/logo.png" width="16" height="16"
        style="margin-right: 4px;" />
      <span>huzuni</span>
    `;
    huzuniButton.style['display'] = 'flex';

    this.api.topPanel.appendStart(
      huzuniButton,
      'https://github.com/Firstbober/rkgk-huzuni',
    );

    huzuniButton.parentElement.style['paddingLeft'] = '4px';
    huzuniButton.parentElement.style['paddingRight'] = '4px';
  }

  start(api: HuzuniAPI): void {
    this.api = api;

    this.setupHuzuniMenuBar();
    this.scriptManager = new ScriptManager(api);
  }
  stop(): void {}
}
