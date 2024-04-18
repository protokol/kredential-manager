
export function parseRedirectHeaders(headers: any) {
    const location = headers.get('Location');

    return {
        location
    };
}