export async function adminFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  return fetch(input, {
    ...init,
    credentials: 'include',
    headers: {
      ...(init.headers || {}),
    },
  });
}

export async function adminLogout() {
  await fetch('/api/auth', { method: 'DELETE', credentials: 'include' });
}
