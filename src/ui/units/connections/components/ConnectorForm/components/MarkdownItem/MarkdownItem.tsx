import React from 'react';

import {connect} from 'react-redux';
import type {Dispatch} from 'redux';
import {bindActionCreators} from 'redux';
import type {DatalensGlobalState} from 'ui';

import {YfmWrapper} from '../../../../../../components/YfmWrapper/YfmWrapper';
import {api, setCachedHtmlItem} from '../../../../store';
import {stringToHash} from '../../../../utils';

type DispatchProps = ReturnType<typeof mapDispatchToProps>;
type DispatchState = ReturnType<typeof mapStateToProps>;
type OwnProps = {text?: string; fallback?: React.ReactNode; onLoad?: () => void};
type MarkdownItemProps = DispatchProps & DispatchState & OwnProps;

const MarkdownItemComponent = ({
    actions,
    cachedHtml,
    text,
    fallback,
    onLoad,
}: MarkdownItemProps) => {
    const hash = React.useMemo(() => text && stringToHash(text), [text]);
    const [html, setHtml] = React.useState(hash && cachedHtml[hash] ? cachedHtml[hash] : '');
    const [loading, setLoading] = React.useState(false);

    const getHtml = React.useCallback(
        async (args: {hash: string; text: string}) => {
            setLoading(true);
            const resultHtml = await api.fetchRenderedMarkdown(args.text);
            actions.setCachedHtmlItem({hash: args.hash, html: resultHtml});
            onLoad?.();
            setHtml(resultHtml);
            setLoading(false);
        },
        [actions, onLoad],
    );

    React.useEffect(() => {
        if (hash && text && !html && !loading) {
            getHtml({hash, text});
        }
    }, [hash, html, text, loading, getHtml]);

    if (!html) {
        return fallback ? <React.Fragment>{fallback}</React.Fragment> : null;
    }

    return <YfmWrapper setByInnerHtml={true} content={html} noMagicLinks={true} />;
};

const mapStateToProps = (state: DatalensGlobalState) => {
    return {
        cachedHtml: state.connections.cachedHtml,
    };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
    return {
        actions: bindActionCreators(
            {
                setCachedHtmlItem,
            },
            dispatch,
        ),
    };
};

export const MarkdownItem = connect(mapStateToProps, mapDispatchToProps)(MarkdownItemComponent);
