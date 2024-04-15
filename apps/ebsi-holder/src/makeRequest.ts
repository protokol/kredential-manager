export default async function makeRequest(url: string, method: string, body = null) {
    console.log(`Making ${method} request to: ${url}`);
    const headers = new Headers({
        'Content-Type': 'application/json',
    });

    const requestBody = body ? JSON.stringify(body) : null;

    try {
        const response = await fetch(url, {
            method,
            headers,
            body: requestBody,
            redirect: 'manual'
        });

        if (response.status == 302) {
            return response
        }

        if (!response.ok) {
            const errorText = await response.json();
            throw new Error(`Network response was not ok: ${response.status} ${response.statusText}. Error: ${errorText}`);
        }
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}