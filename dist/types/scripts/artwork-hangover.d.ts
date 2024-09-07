import { HuzuniAPI, HuzuniScript } from '../huzuni-api';
export default class ArtworkHangover implements HuzuniScript {
    api: HuzuniAPI;
    chatElement: HTMLElement;
    start(api: HuzuniAPI): void;
    stop(): void;
}
