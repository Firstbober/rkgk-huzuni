import { HuzuniAPI, HuzuniScript } from '../huzuni-api';
export declare class CustomVariables implements HuzuniScript {
    api: HuzuniAPI;
    createVariable(): HTMLDivElement;
    start(api: HuzuniAPI): void;
    stop(): void;
}
