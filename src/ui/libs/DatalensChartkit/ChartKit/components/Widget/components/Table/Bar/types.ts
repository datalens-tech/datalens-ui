import type {BarViewOptions} from 'shared';

export type BarProps = {
    /** Value that is used in calculations. Also used as default label */
    value: number;
    /** Maximum range value. Should be equal or greater `offset` value */
    max?: number;
    /** Minimum range value. Should be equal or less `offset` value */
    min?: number;
    /** Forced bar alignment. Ignored if the minimum and maximum are specified */
    align?: BarViewOptions['align'];
    /** Css style for bar height. `100%` by default */
    barHeight?: string | number;
    /** Offset for separator line. 0 by default */
    offset?: number;
    /** Css style for bar color.
     * [--g-color-base-neutral-medium](https://github.com/gravity-ui/uikit/blob/main/styles/colors/infographics/light.scss#L14) by default
     * */
    color?: string;
    /** Label value */
    formattedValue?: string;
    /** Manage label visibility. `true` by default */
    showLabel?: boolean;
    /** Manage bar`s view visibility. `true` by default */
    showBar?: boolean;
    /** Manage seperators`s view visibility. `true` by default */
    showSeparator?: boolean;
    /** Manage debug info visibility. `true` by default */
    debug?: boolean;
};

export type GetBarStyleArgs = Partial<{
    [key in 'color' | 'min' | 'max' | 'align' | 'offset']: BarProps[key];
}> & {
    value: number;
};

export type GetMinMaxBarStyleArgs = GetBarStyleArgs & {
    min: number;
    max: number;
};

export type GetMinBarStyleArgs = Omit<GetBarStyleArgs, 'max'> & {
    min: number;
};

export type GetMaxBarStyleArgs = Omit<GetBarStyleArgs, 'min'> & {
    max: number;
};

export type GetStylesArgs = GetBarStyleArgs & {
    barHeight?: BarProps['barHeight'];
    isValid?: boolean;
    showBar?: boolean;
    showSeparator?: boolean;
};

export type GetMinMaxWithOffsetArgs = {
    offset: number;
    min?: number;
    max?: number;
};
