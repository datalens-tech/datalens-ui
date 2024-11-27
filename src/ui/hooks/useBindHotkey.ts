import {useHotkeys} from 'react-hotkeys-hook';
import type {Options} from 'react-hotkeys-hook';

import {MOD_KEY} from '../constants/misc';
import {getMetaKey} from '../utils';

/**
 * Binds hotkey via useHotkeys, but using correct meta key for current os
 */
export function useBindHotkey({
    key,
    handler,
    options,
}: {
    key: string[];
    handler: () => void;
    options: Options;
}) {
    const fullKey = key.map((keyPart) => (keyPart === MOD_KEY ? getMetaKey() : keyPart)).join('+');

    useHotkeys(fullKey, handler, options);
}
