import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class ProxyService {
    async getRedirectLocation(url: string): Promise<string> {
        try {
            const response = await axios.get(url, {
                maxRedirects: 0,
                validateStatus: (status) => status >= 200 && status < 400,
            });
            return response.headers['location'];
        } catch (error) {
            if (error.response && error.response.status === 302) {
                return error.response.headers['location'];
            }
            throw error;
        }
    }
}