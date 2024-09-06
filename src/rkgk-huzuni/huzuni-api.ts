import { artworkProtocol } from './modules/artwork-protocol';
import { huzuniUI } from './modules/huzuni-ui';
import { rightPanel, topPanel } from './modules/panels';
import { rkgkInternals } from './modules/rkgk-internals';
import { scriptManager } from './modules/script-manager';

export class HuzuniAPI {
  topPanel = topPanel;
  rightPanel = rightPanel;
  huzuniUI = huzuniUI;

  rkgkInternals = rkgkInternals;
  artworkProtocol = artworkProtocol;
  scriptManager = scriptManager;
}

export interface HuzuniScript {
  start(api: HuzuniAPI): void;
  stop(): void;
}
