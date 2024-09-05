import { artworkProtocol } from './modules/artwork-protocol';
import { huzuniUI } from './modules/huzuni-ui';
import { rightPanel, topPanel } from './modules/panels';

export class HuzuniAPI {
  topPanel = topPanel;
  rightPanel = rightPanel;
  huzuniUI = huzuniUI;
  artworkProtocol = artworkProtocol;
}

export interface HuzuniScript {
  start(api: HuzuniAPI): void;
  stop(): void;
}
