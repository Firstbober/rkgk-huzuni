import { HuzuniAPI, HuzuniScript } from '../huzuni-api';

export default class ArtworkHangover implements HuzuniScript {
  api: HuzuniAPI;

  chatElement: HTMLElement;

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

        api.artworkProtocol.sendBroadcastMessage({
          type: 'chatMessage',
          message: messageText,
        });
        textarea.value = '';
      }
    });

    chat.appendChild(textarea);

    const addMessage = (content: string, system: boolean = false) => {
      const message = document.createElement('span');
      message.innerText = content;
      message.style['borderBottom'] = '1px solid var(--color-panel-border)';
      message.style['opacity'] = system ? '0.5' : '1.0';

      messageList.appendChild(message);
      messageList.scrollTo({
        top: messageList.scrollHeight,
      });
    };

    // Handle artwork messages
    api.artworkProtocol.events.message = (sessionId, json) => {
      if (!api.enabled) return;
      if (json.type != 'chatMessage') return;

      addMessage(
        `<${api.rkgkInternals.getUsernameBySessionId(sessionId)}>: ${json.message}`,
      );
    };

    // User joined/left
    api.rkgkInternals.events.userJoined = (sid, nickname) => {
      if (!api.enabled) return;
      addMessage(`User <${nickname}> joined!`, true);
    };

    api.rkgkInternals.events.userLeft = (sid, nickname) => {
      if (!api.enabled) return;
      addMessage(`User <${nickname}> left!`, true);
    };

    this.chatElement = chat;
    document.getElementsByTagName('main')[0].appendChild(chat);
  }
  stop(): void {
    this.chatElement.remove();
  }
}
