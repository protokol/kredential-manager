import { Injectable } from '@nestjs/common';

@Injectable()
export class ProxyService {
    async getRedirectLocation(url: string): Promise<string> {
        try {
            const response = await fetch(url, {
                method: 'GET',
                redirect: 'manual',
            });
            if (response.status >= 200 && response.status < 400) {
                return response.headers.get('location');
            }

            throw new Error(`Unexpected response status: ${response.status}`);
        } catch (error) {
            if (error.response && error.response.status === 302) {
                return error.response.headers['location'];
            }
            throw error;
        }
    }
}