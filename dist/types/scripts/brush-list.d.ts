import { HuzuniAPI, HuzuniScript } from '../huzuni-api';
export declare class BrushList implements HuzuniScript {
    api: HuzuniAPI;
    brushListRoot: HTMLDivElement;
    brushList: HTMLSelectElement;
    removeButton: HTMLButtonElement;
    brushes: Map<string, {
        code: string;
        name: string;
    }>;
    reservedBrushes: string[];
    addBrush(): void;
    removeBrush(name: string): void;
    getBrush(name: string): string;
    changeBrush(name: string, code: string): void;
    start(api: HuzuniAPI): void;
    stop(): void;
}
