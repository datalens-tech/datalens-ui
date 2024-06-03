import React from 'react';

import type {LoaderProps} from '@gravity-ui/uikit';
import {Loader} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';

import './Veil.scss';

const b = block('dl-veil');

type VeilProps = {
    className?: string;
    loaderProps?: Partial<LoaderProps>;
    withLoader?: boolean;
};

const getPreparedLoaderProps = (
    props: VeilProps['loaderProps'],
): {loaderClassName?: string; restLoaderProps?: Omit<VeilProps['loaderProps'], 'className'>} => {
    if (props) {
        const {className: loaderClassName, ...restLoaderProps} = props;
        return {loaderClassName, restLoaderProps};
    }

    return {};
};

/**
 * "Vail" to overlay the content of the parent block.
 * The parent must have any `position` value other than `static'.
 * @param {VeilProps} props
 * @returns {Veil}
 */
export const Veil = (props: VeilProps) => {
    const {className, loaderProps, withLoader = true} = props;
    const {loaderClassName, restLoaderProps} = getPreparedLoaderProps(loaderProps);

    return (
        <div className={b(null, className)}>
            {withLoader && (
                <Loader className={b('loader', loaderClassName)} size="m" {...restLoaderProps} />
            )}
        </div>
    );
};
