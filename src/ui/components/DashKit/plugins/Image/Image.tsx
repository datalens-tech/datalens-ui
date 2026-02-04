import React from 'react';

import type {Plugin, PluginWidgetProps} from '@gravity-ui/dashkit';
import block from 'bem-cn-lite';
import type {DashTabItemImage} from 'shared';
import {CustomPaletteBgColors, DashTabItemType} from 'shared';

import {useBeforeLoad} from '../../../../hooks/useBeforeLoad';
import type {CommonPluginSettings} from '../../DashKit';
import {useWidgetContext} from '../../context/WidgetContext';
import {usePreparedWrapSettings} from '../../utils';
import {RendererWrapper} from '../RendererWrapper/RendererWrapper';

import './Image.scss';

const b = block('dashkit-plugin-image');

type Props = PluginWidgetProps & {
    data: DashTabItemImage['data'] & PluginWidgetProps['data'];
};

type PluginImageObjectSettings = CommonPluginSettings;

type PluginImage = Plugin<Props> &
    CommonPluginSettings & {
        setSettings: (settings: PluginImageObjectSettings) => PluginImage;
    };

export const pluginImage: PluginImage = {
    type: DashTabItemType.Image,
    defaultLayout: {w: 12, h: 12, minH: 1, minW: 1},
    setSettings: (settings: PluginImageObjectSettings) => {
        pluginImage.globalWidgetSettings = settings.globalWidgetSettings;
        return pluginImage;
    },
    renderer: PluginImageRenderer,
};

function PluginImageRenderer(props: Props, _ref?: React.LegacyRef<HTMLDivElement>) {
    const {
        id,
        data: {
            alt,
            background,
            backgroundSettings,
            borderRadius,
            internalMarginsEnabled,
            src,
            preserveAspectRatio,
        },
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

    const {style} = usePreparedWrapSettings({
        ownWidgetSettings: {
            background: background,
            backgroundSettings: backgroundSettings,
            borderRadius: borderRadius,
            internalMarginsEnabled: internalMarginsEnabled,
        },
        dashVisualSettings: {
            background: undefined,
            backgroundSettings: undefined,
            widgetsSettings: pluginImage.globalWidgetSettings,
        },
        defaultOldColor: CustomPaletteBgColors.NONE,
    });

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
        <RendererWrapper id={id} type={DashTabItemType.Image} nodeRef={rootNodeRef} style={style}>
            <img
                className={b({'preserve-aspect-ratio': preserveAspectRatio})}
                alt={alt}
                src={src}
            />
        </RendererWrapper>
    );
}
