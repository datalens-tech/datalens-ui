import {useHotkeys} from 'react-hotkeys-hook';
import type {HotkeyCallback, Options} from 'react-hotkeys-hook';

import {MOD_KEY} from '../constants/misc';
import {getMetaKey} from '../utils';

type UseBindHotkeyOptions =
    | {
          key: string[];
          keys?: undefined;
          handler: HotkeyCallback;
          options: Options;
      }
    | {
          key?: undefined;
          keys: string[][];
          handler: HotkeyCallback;
          options: Options;
      };

const joinKeyParts = (keys: string[]) =>
    keys.map((keyPart: string) => (keyPart === MOD_KEY ? getMetaKey() : keyPart)).join('+');
/**
 * Binds hotkey via useHotkeys, but using correct meta key for current os
 */
export function useBindHotkey({key, keys, handler, options}: UseBindHotkeyOptions) {
    let fullKeys: string[] = [];

    if (key) {
        fullKeys.push(joinKeyParts(key));
    } else if (keys) {
        fullKeys = keys.map(joinKeyParts);
    }

    useHotkeys(fullKeys, handler, options);
}
