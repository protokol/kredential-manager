export default async function makeRequest(url: string, options: RequestInit) {
    try {
        const response = await fetch(url, options);

        if (!(response.status == 302 || response.status == 200 || response.status == 202)) {
            console.error({ url })
            throw new Error(`Network response was not ok: ${response.status} ${response.statusText}.}`);

        }
        return response
    } catch (error) {
        console.error("Fetch error: ", error);
        throw error;
    }
}