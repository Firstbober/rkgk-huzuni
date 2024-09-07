export declare class HuzuniAPI {
    enabled: boolean;
    topPanel: {
        test(): boolean;
        getPanelElement(): Element;
        appendStart(element: HTMLElement): HTMLAnchorElement;
        appendEnd(element: HTMLElement, href?: string): void;
    };
    rightPanel: {
        test(): boolean;
        getPanelElement(): HTMLDivElement;
        getBrushEditorElement(): HTMLDivElement;
        getCodeEditor(): rkgk_code_editor.CodeEditor;
        appendEnd(element: HTMLElement): void;
    };
    huzuniUI: {
        setupCSS(): void;
        tabs(labels: string[], content: HTMLElement[]): HTMLElement;
        dialog(title: string, content: HTMLElement): {
            show: () => void;
            hide: () => void;
        };
    };
    rkgkInternals: {
        session: rkgk_session.Session;
        currentUserId: number;
        handleRkGkImports(body: any, name: string, path: string, imported: boolean): Promise<boolean>;
        importRkgkInternals(): Promise<boolean>;
        insertNewIndex(): Promise<void>;
        hijackIndex(): Promise<boolean>;
        test(): Promise<boolean>;
        setupListeners(): void;
        sendSetBrush(brush: string): void;
        getUsernameBySessionId(sessionId: number): string;
        events: import("./modules/rkgk-internals").SessionEventHandlers;
    };
    artworkProtocol: import("./modules/artwork-protocol").ArtworkProtocol;
    scriptManager: import("./modules/script-manager").ScriptManager;
}
export interface HuzuniScript {
    start(api: HuzuniAPI): void;
    stop(): void;
}
