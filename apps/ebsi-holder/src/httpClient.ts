import makeRequest from './makeRequest';

export class HttpClient {
    /**
     * Perform a GET request.
     * @param {string} url - The URL to request.
     * @param {RequestInit} [options] - Optional fetch request configuration.
     * @returns {Promise<any>} - The request promise.
     */
    async get(url: string, options: RequestInit = {}): Promise<any> {
        options.method = 'GET';
        options.redirect = 'manual';
        try {
            const response = await fetch(url, options);
            return response
        } catch (error) {
            console.error("Fetch error: ", error);
            throw error;
        }
    }

    /**
     * Perform a POST request.
     * @param {string} url - The URL to request.
     * @param {any} data - The data to be sent as the request body.
     * @param {RequestInit} [options] - Optional fetch request configuration.
     * @returns {Promise<any>} - The request promise.
     */
    async post(url: string, data: any, options: RequestInit = {}): Promise<any> {
        options.method = 'POST';
        options.redirect = 'manual';
        // Define default headers
        const defaultHeaders = {
            'Content-Type': 'application/json',
        };

        // Ensure options.headers is treated as an object with string keys
        const headers = {
            ...defaultHeaders,
            ...(options.headers as Record<string, string>),
        };

        if (options && headers['Content-Type'] === 'application/x-www-form-urlencoded' && data && typeof data === 'object') {
            data = new URLSearchParams(data)
        } else if (options && headers['Content-Type'] === 'application/json' && data && typeof data === 'object') {
            data = JSON.stringify(data);
        } else {
            data = data;
        }
        // Prepare the final options for the fetch request
        const finalOptions: RequestInit = {
            ...options,
            headers: headers,
            body: data,
        };

        return makeRequest(url, finalOptions);
    }
}