import defaultLogger from '@gravity-ui/ui-logger';

import {parseError} from '../../utils/errors/parse';

export const DATALENS_LOGGER = 'dl';
export const CHARTKIT_LOGGER = 'dl-chartkit';

const logger: typeof defaultLogger = defaultLogger.get(DATALENS_LOGGER);

logger.setSettings({
    parseError,
});

const chartkitLogger = logger.get(CHARTKIT_LOGGER);
chartkitLogger.setSettings({
    parseError,
    bufferSize: 100,
});

export default logger;
