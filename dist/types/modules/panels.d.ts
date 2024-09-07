declare class TopPanel {
    test(): boolean;
    getPanelElement(): Element;
    appendStart(element: HTMLElement): HTMLAnchorElement;
    appendEnd(element: HTMLElement, href?: string): void;
}
declare class RightPanel {
    test(): boolean;
    getPanelElement(): HTMLDivElement;
    getBrushEditorElement(): HTMLDivElement;
    getCodeEditor(): rkgk_code_editor.CodeEditor;
    appendEnd(element: HTMLElement): void;
}
export declare const topPanel: TopPanel;
export declare const rightPanel: RightPanel;
export {};
