export {
    getGatewayConfig,
    isGatewayError,
    GatewayApiErrorResponse,
} from '../../src/server/utils/gateway';
export {getUtilsAxios} from '../../src/server/utils/axios';
export {getConfiguredRoute} from '../../src/server/utils/routes';
export {addTranslationsScript, getLang} from '../../src/server/utils/language';

import {default as utils} from '../../src/server/utils';
export const getFormattedLogin = utils.getFormattedLogin;
export const getEnvVariable = utils.getEnvVariable;
export const getName = utils.getName;
