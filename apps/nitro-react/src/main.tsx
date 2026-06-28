import './sso-inject';

const RENDERER_CONFIG_URL = '/renderer-config.json';

async function loadConfig(): Promise<Record<string, unknown>> {
  const res = await fetch(RENDERER_CONFIG_URL);
  const config = await res.json();
  return config;
}

async function init() {
  const config = await loadConfig();

  const ticket = localStorage.getItem('sso.ticket');
  if (ticket) {
    config['sso.ticket'] = ticket;
  }

  const nitroRoot = document.getElementById('nitro-root');
  if (!nitroRoot) {
    console.error('[Nitro] #nitro-root not found');
    return;
  }

  // @ts-expect-error — Nitro global config injection
  window.__NITRO_CONFIG__ = config;

  const { default: renderApp } = await import('./app');
  renderApp(nitroRoot, config);
}

init();
