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
        return makeRequest(url, options);
    }

    /**
     * Perform a POST request.
     * @param {string} url - The URL to request.
     * @param {any} data - The data to be sent as the request body.
     * @param {RequestInit} [options] - Optional fetch request configuration.
     * @returns {Promise<any>} - The request promise.
     */
    async post(url: string, data: any, options: RequestInit = {}): Promise<any> {
        // Define default headers
        const defaultHeaders = {
            'Content-Type': 'application/json',
        };

        // Ensure options.headers is treated as an object with string keys
        const headers = {
            ...defaultHeaders,
            ...(options.headers as Record<string, string>),
        };

        // Prepare the final options for the fetch request
        const finalOptions: RequestInit = {
            ...options,
            method: 'POST',
            headers: headers,
            body: headers['Content-Type'] === 'application/json' ? JSON.stringify(data) : data,
        };

        return makeRequest(url, finalOptions);
    }
}