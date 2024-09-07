import { HuzuniAPI, HuzuniScript } from '../huzuni-api';
interface ScriptMetadata {
    name: string;
    author: string;
    description: string;
}
declare class ScriptManager {
    api: HuzuniAPI;
    loadedIds: string[];
    scriptListNode: HTMLDivElement;
    storageKeys: {
        code: string;
        scripts: string;
        liveReloadURL: string;
        liveReloadCode: string;
    };
    constructor(api: HuzuniAPI);
    getScriptMetadata(code: string): {
        errors: string[];
        metadata?: ScriptMetadata;
    };
    getScriptsStore(): {
        [index: string]: {
            metadata: ScriptMetadata;
            code: string;
            enabled: boolean;
        };
    };
    getScriptListElement(name: string, description: string, author: string): HTMLDivElement;
    checkScriptStorage(): void;
    checkLiveReloadURL(): void;
    addScript(metadata: ScriptMetadata, code: string): boolean;
    removeScript(id: string): void;
    enableScript(id: string): boolean;
    disableScript(id: string): void;
    createCodeEditor(): {
        root: HTMLDivElement;
        finish: () => void;
    };
    createLiveCodeReload(): {
        element: HTMLDivElement;
        finish: () => void;
    };
    setupScriptManagerUI(): {
        element: HTMLElement;
        finish: () => void;
    }[];
}
export default class HuzuniOverlay implements HuzuniScript {
    api: HuzuniAPI;
    scriptManager: ScriptManager;
    storageKeys: {};
    setupHuzuniMenuBar(showDialog: () => void): void;
    setupInfoPanel(hide: () => void): HTMLElement;
    start(api: HuzuniAPI): void;
    stop(): void;
}
export {};
