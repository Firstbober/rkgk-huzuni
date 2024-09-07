interface ArtworkEventHandler {
    message(sessionId: number, json: any): void;
}
export declare class ArtworkProtocol {
    ARTWORK_MESSAGE_PREFIX: string;
    test(): boolean;
    encodeArtworkMessage(message: any): string;
    decodeArtworkMessage(message: any): any;
    setupListeners(): void;
    sendBroadcastMessage(data: any): void;
    events: ArtworkEventHandler;
}
export declare const artworkProtocol: ArtworkProtocol;
export {};
