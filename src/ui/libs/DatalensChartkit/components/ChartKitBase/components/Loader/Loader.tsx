import React from 'react';

import type {LoaderSize} from '@gravity-ui/uikit';
import {Loader as CommonLoader} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';

import {ChartKitQa} from '../../../../../../../shared';

import './Loader.scss';

interface LoaderProps {
    visible?: boolean;
    compact?: boolean;
    veil?: boolean;
    delay?: number;
    classNameMod?: string;
    size?: LoaderSize;
}

const b = block('chartkit-loader');

const Loader: React.FC<LoaderProps> = ({visible, compact, veil, delay, classNameMod, size}) => {
    const [showLoader, setShowLoader] = React.useState(typeof delay !== 'number');

    React.useEffect(() => {
        if (typeof delay === 'number') {
            const timerId = setTimeout(() => setShowLoader(true), delay);
            return () => clearTimeout(timerId);
        }
        return;
    }, [delay]);

    if (!visible || !showLoader) {
        return null;
    }

    return (
        <div
            className={b({veil, [String(classNameMod)]: Boolean(classNameMod)})}
            data-qa={ChartKitQa.Loader}
        >
            <div className={b('loader', {compact})}>
                <CommonLoader size={`${size || 'm'}`} />
            </div>
        </div>
    );
};

export default Loader;
