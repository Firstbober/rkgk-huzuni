import { HuzuniAPI, HuzuniScript } from '../huzuni-api';

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

export default class HuzuniOverlay implements HuzuniScript {
  api: HuzuniAPI;

  loadedIds: string[] = [];

  storageKeys = {
    ScriptManager: {
      code: 'huzuni-overlay.script-manager.code',
      scripts: 'huzuni-overlay.script-manager.scripts',
    },
  };

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
      this.storageKeys.ScriptManager.scripts,
    );
    if (scriptsStore == undefined) {
      localStorage.setItem(
        this.storageKeys.ScriptManager.scripts,
        JSON.stringify({}),
      );
      scriptsStore = {};
    } else {
      scriptsStore = JSON.parse(scriptsStore);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return scriptsStore as any;
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

    localStorage.setItem(
      this.storageKeys.ScriptManager.scripts,
      JSON.stringify(store),
    );
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
      this.storageKeys.ScriptManager.scripts,
      JSON.stringify(scriptsStore),
    );
    return true;
  }

  createCodeEditor() {
    const root = document.createElement('div');

    // Editor
    const rkgkCodeEditor = new rkgk_code_editor.CodeEditor();
    root.appendChild(rkgkCodeEditor);
    root.style['marginTop'] = '6px';

    rkgkCodeEditor.addEventListener('.codeChanged', () => {
      localStorage.setItem(
        this.storageKeys.ScriptManager.code,
        rkgkCodeEditor.code,
      );
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

      this.checkScriptStorage();
    });
    buttons.querySelector('.clear').addEventListener('click', () => {
      rkgkCodeEditor.setCode('');
    });

    // Finalize
    return {
      root,
      finish: () => {
        if (localStorage.getItem(this.storageKeys.ScriptManager.code)) {
          rkgkCodeEditor.setCode(
            localStorage.getItem(this.storageKeys.ScriptManager.code),
          );
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
    const c2 = document.createElement('div');
    c2.innerText = 'Script List';

    scriptManagerUI.appendChild(
      this.api.huzuniUI.tabs(
        ['Code Editor', 'Script List'],
        [codeEditor.root, c2],
      ),
    );

    this.api.rightPanel.appendEnd(scriptManagerUI);

    codeEditor.finish();
  }

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
    this.setupScriptManagerUI();

    this.checkScriptStorage();
  }
  stop(): void {}
}
