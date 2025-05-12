import bemBlock from 'bem-cn-lite';

export type CnMods = Record<string, string | boolean | undefined>;

const CN_NAMESPACE = 'dl-gallery';

export function block(postfix: string) {
    return bemBlock(`${CN_NAMESPACE}-${postfix}`);
}
