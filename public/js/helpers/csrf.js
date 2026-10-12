export function csrfHeaders() {
    const token = document.cookie.split('; ')
        .find(c => c.startsWith('XSRF-TOKEN='))?.split('=')[1];
    return token ? { 'X-XSRF-TOKEN': decodeURIComponent(token) } : {};
}
