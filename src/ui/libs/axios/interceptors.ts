import type {AxiosInstance} from 'axios';

export function initBeforeRequestInterceptor(
    axiosInstance: AxiosInstance,
    beforeRequest: () => Promise<unknown>,
) {
    const requestInterceptorId = axiosInstance.interceptors.request.use(
        async (config) => {
            await beforeRequest();
            return config;
        },
        (error) => Promise.reject(error),
    );

    return {requestInterceptorId};
}
