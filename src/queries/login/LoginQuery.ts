import api from '@/lib/axios';
import { AxiosError } from 'axios';

interface LoginQueryProps {
    username: string
    password: string    
}

interface LoginResponse {
    accessToken: string;
    refreshToken: string;
}

interface LoginError {
    message: string;
    status: number;
}

export async function useLoginMutation({ username, password }: LoginQueryProps): Promise<LoginResponse> {
    try {
        const { data } = await api.post<LoginResponse>('/login', { username, password });
        return data;
    } catch (error) {
        if (error instanceof AxiosError) {
            const loginError: LoginError = {
                message: error.response?.data?.message || 'Login failed',
                status: error.response?.status || 500
            };
            throw loginError;
        }
        throw {
            message: 'An unexpected error occurred',
            status: 500
        };
    }
}