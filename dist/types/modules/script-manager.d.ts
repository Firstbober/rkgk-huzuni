import { HuzuniAPI, HuzuniScript } from '../huzuni-api';
interface ScriptData {
    description: string;
    script: HuzuniScript;
    apiInstance?: HuzuniAPI;
    enabled: boolean;
    canBeDisabled: boolean;
}
export declare class ScriptManager {
    scripts: Map<string, ScriptData>;
    test(): boolean;
    registerScript(name: string, description: string, script: HuzuniScript, canBeDisabled?: boolean): boolean;
    enableScript(name: string): void;
    disableScript(name: string): void;
}
export declare const scriptManager: ScriptManager;
export {};
