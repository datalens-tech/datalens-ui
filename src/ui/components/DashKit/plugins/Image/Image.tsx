import React from 'react';

import type {Plugin, PluginWidgetProps} from '@gravity-ui/dashkit';
import block from 'bem-cn-lite';
import type {DashTabItemImage} from 'shared';
import {DashTabItemType} from 'shared';
import {CustomPaletteBgColors} from 'shared/constants/widgets';

import {useBeforeLoad} from '../../../../hooks/useBeforeLoad';
import {useWidgetContext} from '../../context/WidgetContext';
import {getPreparedWrapSettings} from '../../utils';
import {RendererWrapper} from '../RendererWrapper/RendererWrapper';

import './Image.scss';

const b = block('dashkit-plugin-image');

type Props = PluginWidgetProps & {
    data: DashTabItemImage['data'] & PluginWidgetProps['data'];
};

function PluginImage(props: Props, _ref?: React.LegacyRef<HTMLDivElement>) {
    const {
        id,
        data: {alt, background, src, preserveAspectRatio},
        layout,
    } = props;

    const rootNodeRef = React.useRef<HTMLDivElement>(null);
    useWidgetContext({
        id: props.id,
        elementRef: rootNodeRef,
    });

    const handleUpdate = useBeforeLoad(props.onBeforeLoad);
    const currentLayout = layout.find(({i}) => i === props.id) || {
        x: null,
        y: null,
        h: null,
        w: null,
    };
    const backgroundEnabled = Boolean(
        background?.enabled !== false &&
            background?.color &&
            background?.color !== CustomPaletteBgColors.NONE,
    );
    const {classMod, style} = React.useMemo(() => {
        return getPreparedWrapSettings(backgroundEnabled, background?.color);
    }, [backgroundEnabled, background?.color]);

    React.useEffect(() => {
        handleUpdate?.();
    }, [
        handleUpdate,
        currentLayout.x,
        currentLayout.y,
        currentLayout.h,
        currentLayout.w,
        preserveAspectRatio,
        style,
    ]);

    return (
        <RendererWrapper
            id={id}
            type={DashTabItemType.Image}
            nodeRef={rootNodeRef}
            classMod={classMod}
            style={style}
        >
            <img
                className={b({'preserve-aspect-ratio': preserveAspectRatio})}
                alt={alt}
                src={src}
            />
        </RendererWrapper>
    );
}

export const pluginImage: Plugin<Props> = {
    type: DashTabItemType.Image,
    defaultLayout: {w: 12, h: 12, minH: 1, minW: 1},
    renderer: PluginImage,
};
