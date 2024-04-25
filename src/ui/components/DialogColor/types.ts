import {ColorsConfig} from 'shared';

export type ColoredValue = {
    value: string;
    color: string | undefined;
};

export type ValidationStatus = Partial<Record<keyof ColorsConfig, string>>;
