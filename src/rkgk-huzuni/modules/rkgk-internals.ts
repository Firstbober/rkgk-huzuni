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

  async disableIndex() {
    window.addEventListener('beforescriptexecute', (ev) => {
      const script = ev.target as HTMLScriptElement;
      if (script.innerHTML.includes('import "rkgk/index.js";')) {
        const newScript = document.createElement('script');
        newScript.type = 'module';
        newScript.innerHTML = script.innerHTML.replaceAll(
          'import "rkgk/index.js";',
          '',
        );
        newScript.innerHTML += `;console.log('[huzuni] [rkgk-internals] hijacked head import section!');`;
        document.head.appendChild(newScript);

        ev.preventDefault();
        ev.stopPropagation();
        ev.stopImmediatePropagation();
      }
    });
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

    newCode = newCode.replaceAll(`document.getElementById('js-loading')`, '');
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
    let result = true;
    result &&= await rkgkInternals.importRkgkInternals();
    result &&= await rkgkInternals.hijackIndex();

    return result;
  },

  setupListeners() {
    rkgkInternals.session.addEventListener('wallEvent', (ev) => {
      rkgkInternals.events.wall((ev as never)['wallEvent']);
    });
  },

  events: new Proxy(
    {
      wall() {},
    } as SessionEventHandlers,
    new MixinHandler<SessionEventHandlers>(),
  ),
};
