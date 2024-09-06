import { HuzuniAPI, HuzuniScript } from '../huzuni-api';

class ScriptManager {
  scripts = new Map<string, HuzuniScript>();

  test() {
    return true;
  }

  registerScript(name: string, script: HuzuniScript) {
    if (this.scripts.has(name)) {
      console.error(
        `[huzuni] [script-manager] cannot load another script with name "${name}"`,
      );
      return false;
    }

    console.log(`[huzuni] [script-manager] registered new script "${name}"`);

    this.scripts.set(name, script);
    this.enableScript(name);

    return true;
  }

  enableScript(name: string) {
    if (!this.scripts.has(name)) {
      console.warn(
        `[huzuni] [script-manager] cannot enable non-existent script "${name}"`,
      );
      return;
    }

    console.log(`[huzuni] [script-manager] enabled script "${name}"`);

    const api = new HuzuniAPI();
    this.scripts.get(name).start(api);
  }

  disableScript(name: string) {
    if (!this.scripts.has(name)) {
      console.warn(
        `[huzuni] [script-manager] cannot disable non-existent script "${name}"`,
      );
      return;
    }

    console.log(`[huzuni] [script-manager] disabled script "${name}"`);

    this.scripts.get(name).stop();
  }
}

export const scriptManager = new ScriptManager();
