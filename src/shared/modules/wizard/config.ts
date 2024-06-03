import type {ChartsConfig} from '../../types';

export function getDatasetLinks(config: ChartsConfig) {
    const links: Record<string, string> = {};

    config.datasetsIds.forEach((id, i) => {
        const key = `dataset${i > 0 ? i : ''}`;
        links[key] = id;
    });

    return links;
}
