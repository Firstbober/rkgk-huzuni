import { MixinHandler } from '../mixin-handler';
import { rkgkInternals } from './rkgk-internals';

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

interface ArtworkEventHandler {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  message(json: any): void;
}

export const artworkProtocol = {
  ARTWORK_MESSAGE_PREFIX: '-- ARTWORK ',

  encodeArtworkMessage(message: string): string {
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

      artworkProtocol.events.message(message);
    };
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // sendMessage(data: any) {

  // },

  events: new Proxy(
    {
      message() {},
    } as ArtworkEventHandler,
    new MixinHandler<ArtworkEventHandler>(),
  ),
};
