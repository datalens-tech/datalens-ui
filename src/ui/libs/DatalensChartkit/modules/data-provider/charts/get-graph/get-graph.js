import {prepareConfig} from './prepare-config';
import {prepareData} from './prepare-data';

export function getGraph(options, data) {
    prepareData(data, options);

    return {
        config: {
            ...prepareConfig(data, options),
        },
    };
}
