function csrfToken() {
    return document.cookie.split('; ')
        .find(c => c.startsWith('XSRF-TOKEN='))?.split('=')[1];
}
export class HttpError extends Error {
    constructor(status) {
        super(`HTTP ${status}`);
        this.status = status;
    }
}
export async function api(url, options = {}) {
    const res = await fetch(url, {
        credentials: 'same-origin',
        ...options,
        headers: {
            'Accept': 'application/json',
            'X-XSRF-TOKEN': decodeURIComponent(csrfToken() ?? ''),
            ...options.headers
        }
    });
    if (res.status === 401) throw new HttpError(res.status);
    //Throw some HttpErrors here
    if (res.status === 403) throw new HttpError(res.status);
    return res;
}

export function initCsrf() {
    return fetch('/api/csrf-init', { credentials: 'same-origin' });
}