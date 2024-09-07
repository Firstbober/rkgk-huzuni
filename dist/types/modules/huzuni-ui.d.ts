declare class HuzuniUI {
    setupCSS(): void;
    tabs(labels: string[], content: HTMLElement[]): HTMLElement;
    dialog(title: string, content: HTMLElement): {
        show: () => void;
        hide: () => void;
    };
}
export declare const huzuniUI: HuzuniUI;
export {};
