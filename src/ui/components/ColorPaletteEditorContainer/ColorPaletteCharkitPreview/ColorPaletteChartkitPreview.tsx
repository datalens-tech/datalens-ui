import React from 'react';

import ChartKit, {settings} from '@gravity-ui/chartkit';
import type {ChartKitRef} from '@gravity-ui/chartkit';
import {D3Plugin} from '@gravity-ui/chartkit/d3';

import type {ColorPaletteChartkitPreviewProps} from './types';
import {getWidgetData} from './utils';

settings.set({plugins: [D3Plugin]});

const ColorPaletteChartkitPreview = (props: ColorPaletteChartkitPreviewProps) => {
    const {colors, isGradient} = props;
    const chartkitRef = React.useRef<ChartKitRef>();
    const widgetData = getWidgetData({colors, isGradient});

    // TODO: remove after https://github.com/gravity-ui/chartkit/issues/279
    React.useEffect(() => {
        setTimeout(() => chartkitRef.current?.reflow(), 200);
    }, []);

    return <ChartKit ref={chartkitRef} type="d3" data={widgetData} />;
};

export default ColorPaletteChartkitPreview;
