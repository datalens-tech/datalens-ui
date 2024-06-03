import type {CustomCommands, Spec} from 'immutability-helper';
import update, {Context} from 'immutability-helper';

const imm = new Context();

export type AutoExtendCommand<T = object> = CustomCommands<{$auto: Spec<T>}>;

imm.extend('$auto', (value, object) => {
    return object ? update(object, value) : update({}, value);
});

export {imm};
