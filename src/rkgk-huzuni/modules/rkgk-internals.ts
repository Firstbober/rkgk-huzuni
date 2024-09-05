import { MixinHandler } from '../mixin-handler';

export interface SessionEventHandlers {
  wall(wallEvent: {
    sessionId: number;
    kind: {
      event: string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      [index: string]: any;
    };
  }): void;
}

export const rkgkInternals = {
  session: {} as rkgk_session.Session,
  currentUserId: 0,

  async handleRkGkImports(body, name: string, path: string, imported: boolean) {
    if (imported) {
      console.info(`[huzuni] [rkgk-internals] imported "rkgk_${name}"!`);
      globalThis['rkgk_' + name] = body;
      return;
    }

    console.info(
      `[huzuni] [rkgk-internals] importing module "rkgk_${name}" with path "${path}"...`,
    );

    try {
      const body = await import(`${path}`);
      rkgkInternals.handleRkGkImports(body, name, path, true);
      return true;
    } catch (error) {
      console.error(
        `[huzuni] [rkgk-internals] importing module "rkgk_${name}" with path "${path}" failed!`,
      );
      return false;
    }
  },

  async importRkgkInternals() {
    let result = true;

    result &&= await rkgkInternals.handleRkGkImports(
      null,
      'wall',
      'rkgk/wall.js',
      false,
    );
    result &&= await rkgkInternals.handleRkGkImports(
      null,
      'session',
      'rkgk/session.js',
      false,
    );
    result &&= await rkgkInternals.handleRkGkImports(
      null,
      'framework',
      'rkgk/framework.js',
      false,
    );
    result &&= await rkgkInternals.handleRkGkImports(
      null,
      'reticle_renderer',
      'rkgk/reticle-renderer.js',
      false,
    );

    return result;
  },

  insertNewIndex() {
    const oldQuerySelector = document.querySelector;
    document.querySelector = (value: string) => {
      if (value != 'main') return oldQuerySelector.apply(document, [value]);
      setTimeout(async () => {
        document.querySelector = oldQuerySelector;
        await rkgkInternals.importRkgkInternals();
        await rkgkInternals.hijackIndex();
      }, 1);
      throw Error('[huzuni] got em');
    };
  },

  async hijackIndex() {
    console.info('[huzuni] [rkgk-internals] starting hijacking of index.js...');

    const code = await (await fetch('static/index.js')).text();

    let gatekeeper = true;
    let newCode = '';
    for (const line of code.split('\n')) {
      if (line.startsWith('const updateInterval = 1000 / 60;')) {
        gatekeeper = false;
      }

      if (gatekeeper) continue;
      newCode += line + '\n';
    }

    console.info('[huzuni] [rkgk-internals] removing js-loading from index...');

    const js_loading = document.createElement('div');
    js_loading.id = 'js-loading';
    document.body.appendChild(js_loading);

    newCode =
      `
      const Wall = rkgk_wall.Wall;

      const getLoginSecret = rkgk_session.getLoginSecret;
      const getUserId = rkgk_session.getUserId;
      const isUserLoggedIn = rkgk_session.isUserLoggedIn;
      const newSession = huzuni.rkgk_overrides.newSession;
      const registerUser = rkgk_session.registerUser;
      const waitForLogin = rkgk_session.waitForLogin;

      const debounce = rkgk_framework.debounce;
      const ReticleCursor = rkgk_reticle_renderer.ReticleCursor;
    ` + newCode;

    globalThis.huzuni.rkgk_overrides = {
      newSession: async (
        values: Parameters<typeof rkgk_session.newSession>[0],
      ) => {
        rkgkInternals.session = await rkgk_session.newSession(values);
        rkgkInternals.setupListeners();
        return rkgkInternals.session;
      },
    };

    eval(newCode);

    return true;
  },

  async test() {
    return true;
  },

  setupListeners() {
    rkgkInternals.session.addEventListener('wallEvent', (ev) => {
      rkgkInternals.events.wall((ev as never)['wallEvent']);
    });

    rkgkInternals.events.wall = (wallEvent) => {
      if (wallEvent.kind.event == 'join') {
        rkgkInternals.session.wallInfo.online.push({
          sessionId: wallEvent.sessionId,
          brush: wallEvent.kind.init.brush,
          nickname: wallEvent.kind.nickname,
        });
      } else if (wallEvent.kind.event == 'leave') {
        for (let i = 0; i < rkgkInternals.session.wallInfo.online.length; i++) {
          const user = rkgkInternals.session.wallInfo.online[i];
          if (user.sessionId == wallEvent.sessionId)
            rkgkInternals.session.wallInfo.online.splice(i, 1);
        }
      }
    };
  },

  sendSetBrush(brush: string) {
    rkgkInternals.session.sendSetBrush(brush);
  },

  getUsernameBySessionId(sessionId: number): string {
    for (const user of rkgkInternals.session.wallInfo.online) {
      if (user.sessionId == sessionId) return user.nickname;
    }
    return undefined;
  },

  events: new Proxy(
    {
      wall() {},
    } as SessionEventHandlers,
    new MixinHandler<SessionEventHandlers>(),
  ),
};
