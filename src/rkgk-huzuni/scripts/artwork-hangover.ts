import { HuzuniAPI, HuzuniScript } from '../huzuni-api';

export default class ArtworkHangover implements HuzuniScript {
  api: HuzuniAPI;

  start(api: HuzuniAPI): void {
    this.api = api;

    // Chat window
    const chat = document.createElement('div');
    chat.style['display'] = 'flex';
    chat.style['position'] = 'absolute';
    chat.style['left'] = '0';
    chat.style['bottom'] = '0';
    chat.style['height'] = 'fit-content';
    chat.style['margin-left'] = '16px';
    chat.style['margin-bottom'] = '16px';
    chat.style['padding'] = '4px';
    chat.style['flexDirection'] = 'column';

    chat.classList.add('rkgk-panel');

    // Chat message list
    const messageList = document.createElement('div');
    messageList.style['display'] = 'flex';
    messageList.style['flexDirection'] = 'column';
    messageList.style['maxHeight'] = '300px';
    messageList.style['marginBottom'] = '6px';
    messageList.style['overflowY'] = 'scroll';

    chat.appendChild(messageList);

    // Chat editor field
    const textarea = document.createElement('textarea');
    textarea.rows = 1;
    textarea.cols = 30;

    textarea.addEventListener('keyup', (ev) => {
      if (ev.key == 'Enter') {
        const messageText = textarea.value.trim();
        if (messageText.length == 0) return;

        const message = document.createElement('span');
        message.innerText = `<you>: ${messageText}`;
        message.style['borderBottom'] = '1px solid var(--color-panel-border)';

        messageList.appendChild(message);
        messageList.scrollTo({
          top: messageList.scrollHeight,
        });

        textarea.value = '';
      }
    });

    chat.appendChild(textarea);

    document.getElementsByTagName('main')[0].appendChild(chat);
  }
  stop(): void {}
}
