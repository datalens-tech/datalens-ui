const TRUE_FLAGS = ['1', 'true', true];

export function isTrueArg(arg: any): boolean {
    return TRUE_FLAGS.includes(arg);
}
