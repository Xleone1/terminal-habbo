const RENDERER_CONFIG_URL = '/renderer-config.json';
const SSO_TICKET_KEY = 'sso.ticket';

const _originalFetch = window.fetch;

window.fetch = async function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;

  const response = await _originalFetch.call(this, input, init);

  if (url === RENDERER_CONFIG_URL || url.endsWith(RENDERER_CONFIG_URL)) {
    const clone = response.clone();
    try {
      const config = await clone.json();
      const ticket = localStorage.getItem(SSO_TICKET_KEY);
      if (ticket) {
        config['sso.ticket'] = ticket;
      }
      return new Response(JSON.stringify(config), {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      });
    } catch {
      return response;
    }
  }

  return response;
};
