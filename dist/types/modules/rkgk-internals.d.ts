export interface SessionEventHandlers {
    wall(wallEvent: {
        sessionId: number;
        kind: {
            event: string;
            [index: string]: any;
        };
    }): void;
    userJoined(sessionId: number, name: string): void;
    userLeft(sessionId: number, name: string): void;
}
declare class RkGkInternals {
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
    events: SessionEventHandlers;
}
export declare const rkgkInternals: RkGkInternals;
export {};
