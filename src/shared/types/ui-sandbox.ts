import type {UISandboxContext} from '../constants/ui-sandbox';

export type UISandboxWrappedFunction = {
    fn: string;
    ctx: (typeof UISandboxContext)[keyof typeof UISandboxContext];
};
