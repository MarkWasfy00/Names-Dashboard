import api from '@/lib/axios';
import { AxiosError } from 'axios';


interface WatcherQueryProps {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    data: Watcher[];
}

export type Watcher = {
    id: string;
    username: string;
    platform: string;
    interaction: 'comment' | 'tip' | 'subscription' | 'membershipGift' | 'superchat';
}

interface WatcherError {
    message: string;
    status: number;
}


export const getWatchersQuery = ({ page, pageSize, prefix, sortBy }: { page: number; pageSize: number, prefix: string, sortBy: string }) => {
    return {
        queryKey: ['watchers', page, pageSize, prefix, sortBy],
        queryFn: async () => {
            try {
                const { data } = await api.get<WatcherQueryProps>('/dashboard/watchers', { params: { page, pageSize, prefix, sortBy } });
                return data;
            } catch (error) {
                if (error instanceof AxiosError) {
                    const watcherError: WatcherError = {
                        message: error.response?.data?.message || 'Watcher failed', 
                        status: error.response?.status || 500
                    };
                    throw watcherError;
                }
                throw {
                    message: 'An unexpected error occurred',
                    status: 500
                };
            }
        }
    };
};

export const deleteWatcherMutation = () => {
    return {
        mutationFn: async (id: string) => {
            try {
                await api.delete(`/dashboard/watchers/${id}`);
            } catch (error) {
                if (error instanceof AxiosError) {
                    const watcherError: WatcherError = {
                        message: error.response?.data?.message || 'Delete failed', 
                        status: error.response?.status || 500
                    };
                    throw watcherError;
                }
                throw {
                    message: 'An unexpected error occurred',
                    status: 500
                };
            }
        }
    };
};

export const deleteAllWatchersMutation = () => {
    return {
        mutationFn: async () => {
            try {
                await api.delete('/dashboard/watchers');
            } catch (error) {
                console.log(error);
                if (error instanceof AxiosError) {
                    const watcherError: WatcherError = {
                        message: error.response?.data?.message || 'No watchers found to delete.', 
                        status: error.response?.status || 500
                    };
                    throw watcherError;
                }
                throw {
                    message: 'An unexpected error occurred',
                    status: 500
                };
            }
        }
    };
};