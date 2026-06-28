export default function renderApp(root: HTMLElement, config: Record<string, unknown>) {
  console.log('[Nitro] config loaded:', config);
  console.log('[Nitro] sso.ticket:', config['sso.ticket'] ?? '(not set)');
}
