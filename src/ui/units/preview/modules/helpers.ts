import {PostMessage} from 'ui/units/dash/modules/postMessage';

import {CHARTKIT_SCROLLABLE_NODE_CLASSNAME} from '../../../libs/DatalensChartkit/ChartKit/helpers/constants';

export function sendEmbedHeight(previewRef: React.RefObject<HTMLDivElement>) {
    if (!previewRef.current) {
        return;
    }

    const scrollableNodesCollection = previewRef.current.getElementsByClassName(
        CHARTKIT_SCROLLABLE_NODE_CLASSNAME,
    );

    if (scrollableNodesCollection.length) {
        const height = scrollableNodesCollection[0].scrollHeight;

        PostMessage.send({iFrameName: window.name, embedHeight: height});
    }
}
