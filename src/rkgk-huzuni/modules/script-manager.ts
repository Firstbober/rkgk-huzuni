import { HuzuniAPI, HuzuniScript } from '../huzuni-api';

export const scriptManager = {
  scripts: new Map<string, HuzuniScript>(),
  test() {
    return true;
  },

  registerScript(name: string, script: HuzuniScript) {
    if (scriptManager.scripts.has(name)) {
      console.error(
        `[huzuni] [script-manager] cannot load another script with name "${name}"`,
      );
      return;
    }

    console.log(`[huzuni] [script-manager] registered new script "${name}"`);

    scriptManager.scripts.set(name, script);
    scriptManager.enableScript(name);
  },

  enableScript(name: string) {
    if (!scriptManager.scripts.has(name)) {
      console.warn(
        `[huzuni] [script-manager] cannot enable non-existent script "${name}"`,
      );
      return;
    }

    console.log(`[huzuni] [script-manager] enabled script "${name}"`);

    const api = new HuzuniAPI();
    scriptManager.scripts.get(name).start(api);
  },
  disableScript(name: string) {
    if (!scriptManager.scripts.has(name)) {
      console.warn(
        `[huzuni] [script-manager] cannot disable non-existent script "${name}"`,
      );
      return;
    }

    console.log(`[huzuni] [script-manager] disabled script "${name}"`);

    scriptManager.scripts.get(name).stop();
  },
};
