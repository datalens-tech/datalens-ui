import React from 'react';

import block from 'bem-cn-lite';
import get from 'lodash/get';
import PropTypes from 'prop-types';

import {YfmWrapper} from '../../../../../../../components/YfmWrapper/YfmWrapper';
import {CHARTKIT_SCROLLABLE_NODE_CLASSNAME} from '../../../../helpers/constants';
import {getRandomCKId} from '../../../../helpers/getRandomCKId';
import Performance from '../../../../modules/perfomance';
import {SNAPTER_HTML_CLASSNAME} from '../constants';

import './Markdown.scss';

const b = block('chartkit-markdown');

async function preloadContent(div) {
    const imgs = [...div.querySelectorAll('img')];

    if (imgs.length > 0) {
        return Promise.all([
            // Waiting for all image files to load
            ...imgs.map((img) => {
                return new Promise((resolve) => {
                    // if image load is alredy complete
                    if (img.complete) {
                        resolve();
                        return;
                    }

                    const handler = () => {
                        img.removeEventListener('load', handler);
                        img.removeEventListener('error', handler);
                        resolve();
                    };

                    // handling error as complete result anyway
                    img.addEventListener('load', handler);
                    img.addEventListener('error', handler);
                });
            }),
            // Waiting for fonts to load as well
            document.fonts.ready,
        ]);
    }

    // if not img waiting only for fonts
    return document.fonts.ready;
}

export function Markdown({data, onLoad, id}) {
    const generatedId = React.useMemo(() => `${id}_${getRandomCKId()}`, [data, id]);
    Performance.mark(generatedId);
    const refLink = React.useRef(null);
    const {html = '', markdown = '', meta} = data.data;
    const metaScripts = get(meta, 'script');

    React.useLayoutEffect(() => {
        if (onLoad) {
            preloadContent(refLink.current).then(() => {
                onLoad({widgetRendering: Performance.getDuration(generatedId)});
            });
        }
    }, [generatedId, onLoad, refLink]);

    if (!html && !markdown) {
        return null;
    }

    return html ? (
        <YfmWrapper
            className={b(false, `${CHARTKIT_SCROLLABLE_NODE_CLASSNAME} ${SNAPTER_HTML_CLASSNAME}`)}
            setByInnerHtml={true}
            content={html}
            metaScripts={metaScripts}
            ref={refLink}
        />
    ) : (
        <YfmWrapper
            className={b(false, `${CHARTKIT_SCROLLABLE_NODE_CLASSNAME} ${SNAPTER_HTML_CLASSNAME}`)}
            content={markdown}
            ref={refLink}
        />
    );
}

Markdown.propTypes = {
    id: PropTypes.string,
    data: PropTypes.shape({
        data: PropTypes.shape({
            html: PropTypes.string,
            markdown: PropTypes.string,
        }),
    }).isRequired,
    onLoad: PropTypes.func,
    onChartLoad: PropTypes.func,
    onRender: PropTypes.func,
};
