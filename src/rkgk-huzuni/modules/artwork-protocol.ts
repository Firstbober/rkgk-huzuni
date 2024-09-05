import { MixinHandler } from '../mixin-handler';
import { rkgkInternals } from './rkgk-internals';

interface ArtworkEventHandler {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  message(sessionId: number, json: any): void;
}

function base64ToBytes(base64) {
  const binString = atob(base64);
  return Uint8Array.from(binString, (m) => m.codePointAt(0));
}

function bytesToBase64(bytes) {
  const binString = Array.from(bytes, (byte) =>
    String.fromCodePoint(byte as number),
  ).join('');
  return btoa(binString);
}

export const artworkProtocol = {
  ARTWORK_MESSAGE_PREFIX: '-- ARTWORK ',

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  encodeArtworkMessage(message: any): string {
    const encoded = bytesToBase64(
      new TextEncoder().encode(JSON.stringify(message)),
    );
    return encoded;
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  decodeArtworkMessage(message): any {
    return JSON.parse(new TextDecoder().decode(base64ToBytes(message)));
  },

  setupListeners() {
    console.log(`[huzuni] [artwork-protocol] setting up listeners`);

    rkgkInternals.events.wall = (wallEvent) => {
      if (wallEvent.kind.event != 'setBrush') return;
      const brush: string = wallEvent.kind.brush;

      if (!brush.startsWith(artworkProtocol.ARTWORK_MESSAGE_PREFIX)) return;

      const message = artworkProtocol.decodeArtworkMessage(
        brush.slice(artworkProtocol.ARTWORK_MESSAGE_PREFIX.length),
      );

      artworkProtocol.events.message(wallEvent.sessionId, message);
    };
  },

  test() {
    return document.querySelector('rkgk-brush-editor') != undefined;
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sendBroadcastMessage(data: any) {
    const currentCode = (
      document.querySelector('rkgk-brush-editor') as unknown as {
        code: string;
      }
    ).code;

    rkgkInternals.sendSetBrush(
      `${artworkProtocol.ARTWORK_MESSAGE_PREFIX}${artworkProtocol.encodeArtworkMessage(data)}`,
    );
    rkgkInternals.sendSetBrush(currentCode);
  },

  events: new Proxy(
    {
      message() {},
    } as ArtworkEventHandler,
    new MixinHandler<ArtworkEventHandler>(),
  ),
};
