import './meta.js?userscript-metadata';

console.log(
  `%chuzuni by Firstbober!`,
  'color: lightblue; font-size: x-large; font-weight: bold;',
);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
class MixinHandler<T extends object> implements ProxyHandler<T> {
  mixins: Map<string | symbol, unknown[]> = new Map();

  set?(target: T, prop: string | symbol, value) {
    if (typeof value !== 'function') {
      console.error(
        "[huzuni] can't set mixin with value different than function",
      );
      return false;
    }

    if (!this.mixins.has(prop)) {
      this.mixins.set(prop, []);
    }

    this.mixins.get(prop).push(value);
    console.debug(`[huzuni] registered mixin for`, prop);
    return true;
  }

  get?(target: T, p: string | symbol) {
    if (typeof target[p] === 'function') {
      return new Proxy(target[p], {
        apply: (targetFn, thisArg, argumentsList) => {
          if (!this.mixins.get(p)) {
            return Reflect.apply(targetFn, thisArg, argumentsList);
          }

          for (const mixs of this.mixins.get(p)) {
            (mixs as typeof targetFn).apply(target, argumentsList);
          }
          return Reflect.apply(targetFn, thisArg, argumentsList);
        },
      });
    } else {
      return Reflect.get(target, p);
    }
  }
}

const topPanel = {
  panelElement: document.querySelectorAll('#panels-overlay .rkgk-panel')[0],

  // Appends HTML element at the start of the panel
  appendStart(element: HTMLElement, href?: string) {
    const a = document.createElement('a');
    a.appendChild(element);
    if (href) a.href = href;

    topPanel.panelElement.insertBefore(
      document.createElement('hr'),
      topPanel.panelElement.firstChild,
    );
    topPanel.panelElement.insertBefore(a, topPanel.panelElement.firstChild);
  },
  // Appends HTML element at the end of the panel
  appendEnd(element: HTMLElement, href?: string) {
    const a = new HTMLAnchorElement();
    a.appendChild(element);
    if (href) a.href = href;

    topPanel.panelElement.appendChild(document.createElement('hr'));
    topPanel.panelElement.appendChild(element);
  },
};

const rightPanel = {
  getEditor() {
    return document.querySelectorAll('rkgk-brush-editor.rkgk-panel')[0];
  },

  appendEnd(element: HTMLElement) {
    const panel = document.querySelectorAll(
      'div#panels-overlay.panels.fullscreen div.right',
    )[0];
    panel.appendChild(element);
  },
};

globalThis.huzuni = {
  unstable: {
    topPanel,
    rightPanel,
  },
};

function huzuniStartupPlugins() {
  // Huzuni logo
  {
    const text = document.createElement('span');
    text.innerText = 'huzuni';
    topPanel.appendStart(text, 'https://github.com/Firstbober/rkgk-huzuni');

    const img = document.createElement('img');
    img.src =
      'https://raw.githubusercontent.com/Firstbober/rkgk-huzuni/master/static/logo.png';
    img.style['width'] = '16px';
    img.style['height'] = '16px';

    topPanel.appendStart(img, 'https://github.com/Firstbober/rkgk-huzuni');

    img.parentElement.style['paddingLeft'] = '4px';
    img.parentElement.style['paddingRight'] = '4px';
  }

  // Script manager
}

huzuniStartupPlugins();
