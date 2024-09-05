declare module rkgk_session {
  interface WallInfo {
    chunkSize: number;
    hakuLimits: unknown;
    online: string[];
    paintArea: number;
  }

  export class Session extends EventTarget {
    secret?: string;
    sessionId: number;
    userId: string;
    wallId: string;

    wallInfo;
  }

  export async function newSession({
    userId,
    secret,
    wallId,
    userInit,
    onError,
    onDisconnect,
  }: {
    userId: string;
    secret: string;
    wallId: string;
    userInit: {
      brush: string;
    };
    onError: (error: unknown) => void;
    onDisconnect: () => void;
  }): Promise<Session>;
}
