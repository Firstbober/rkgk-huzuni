import { HuzuniAPI, HuzuniScript } from '../huzuni-api';

interface ScriptData {
  description: string;
  script: HuzuniScript;
  apiInstance?: HuzuniAPI;
  enabled: boolean;
  canBeDisabled: boolean;
}

export class ScriptManager {
  scripts = new Map<string, ScriptData>();

  test() {
    return true;
  }

  registerScript(
    name: string,
    description: string,
    script: HuzuniScript,
    canBeDisabled: boolean = true,
  ) {
    if (this.scripts.has(name)) {
      console.error(
        `[huzuni] [script-manager] cannot load another script with name "${name}"`,
      );
      return false;
    }

    console.log(`[huzuni] [script-manager] registered new script "${name}"`);

    this.scripts.set(name, {
      description,
      script,
      enabled: false,
      canBeDisabled,
    });

    if (
      localStorage.getItem(`huzuni.internal-script.${name}.disabled`) ==
      undefined
    )
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
    api.enabled = true;

    this.scripts.get(name).apiInstance = api;
    this.scripts.get(name).enabled = true;
    this.scripts.get(name).script.start(api);
  }

  disableScript(name: string) {
    if (!this.scripts.has(name)) {
      console.warn(
        `[huzuni] [script-manager] cannot disable non-existent script "${name}"`,
      );
      return;
    }

    console.log(`[huzuni] [script-manager] disabled script "${name}"`);

    this.scripts.get(name).apiInstance.enabled = false;
    this.scripts.get(name).enabled = false;
    this.scripts.get(name).script.stop();
  }

  removeScript(name: string) {
    console.log(`[huzuni] [script-manager] removing script "${name}"`);
    this.disableScript(name);
    this.scripts.delete(name);
  }
}

export const scriptManager = new ScriptManager();
