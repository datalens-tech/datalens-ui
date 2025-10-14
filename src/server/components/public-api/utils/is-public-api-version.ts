import {PUBLIC_API_VERSION} from '../constants';
import type {PublicApiVersion} from '../types';

export const isPublicApiVersion = (value: unknown): value is PublicApiVersion => {
    return Object.values(PUBLIC_API_VERSION).includes(value as PublicApiVersion);
};
