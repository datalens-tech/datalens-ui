import type {AxiosError} from 'axios';

import type DatalensChartkitCustomError from '../modules/datalens-chartkit-custom-error/datalens-chartkit-custom-error';

export type CombinedError = Error | AxiosError | DatalensChartkitCustomError;

export type IndexSignatureObject = Record<string, unknown>;
