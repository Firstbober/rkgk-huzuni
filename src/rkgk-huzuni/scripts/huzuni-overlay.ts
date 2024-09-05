import { HuzuniAPI, HuzuniScript } from '../huzuni-api';

export default class HuzuniOverlay implements HuzuniScript {
  api: HuzuniAPI;

  setupScriptManagerUI() {
    const scriptManagerUI = document.createElement('div');
    scriptManagerUI.style['padding'] = '8px';
    scriptManagerUI.innerHTML = `
      <span style="font-size: medium;">Script Manager</span>
    `;

    const c1 = document.createElement('div');
    c1.innerText = 'Code Editor';
    const c2 = document.createElement('div');
    c2.innerText = 'Script List';

    scriptManagerUI.appendChild(
      this.api.huzuniUI.tabs(['Code Editor', 'Script List'], [c1, c2]),
    );

    this.api.rightPanel.appendEnd(scriptManagerUI);
  }

  setupHuzuniMenuBar() {
    const text = document.createElement('span');
    text.innerText = 'huzuni';
    this.api.topPanel.appendStart(
      text,
      'https://github.com/Firstbober/rkgk-huzuni',
    );

    const img = document.createElement('img');
    img.src =
      'https://raw.githubusercontent.com/Firstbober/rkgk-huzuni/master/static/logo.png';
    img.style['width'] = '16px';
    img.style['height'] = '16px';

    this.api.topPanel.appendStart(
      img,
      'https://github.com/Firstbober/rkgk-huzuni',
    );

    img.parentElement.style['paddingLeft'] = '4px';
    img.parentElement.style['paddingRight'] = '4px';
  }

  start(api: HuzuniAPI): void {
    this.api = api;

    this.setupHuzuniMenuBar();
    this.setupScriptManagerUI();
  }
  stop(): void {}
}
