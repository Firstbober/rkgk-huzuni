declare module rkgk_session {
  interface WallInfo {
    chunkSize: number;
    hakuLimits: unknown;
    online: {
      sessionId: number;
      nickname: string;
      brush: string;
    }[];
    paintArea: number;
  }

  export class Session extends EventTarget {
    secret?: string;
    sessionId: number;
    userId: string;
    wallId: string;

    wallInfo: WallInfo;

    sendSetBrush(brush: string);
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

declare module rkgk_code_editor {
  class Selection {
    constructor(anchor: number, cursor: number);

    get start(): number;
    get end(): number;

    clampCursor(text: string);

    set(text: string, n: number);
    advance(text: string, n: number);
  }

  class CodeEditor extends HTMLElement {
    // I don't know what type should be there
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(layers: any[]);

    get code(): string;
    setCode(code: string);

    getSelection(): Selection;
    replace(selection: Selection, text: string);

    undo();
    redo();

    // Anything else is generally useless for most usecases
    // and can be added later.
  }
}
