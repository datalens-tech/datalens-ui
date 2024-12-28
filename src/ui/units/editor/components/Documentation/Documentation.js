import React from 'react';

import {Tabs} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import PropTypes from 'prop-types';
import {Interpolate} from 'ui';
import {registry} from 'ui/registry';

import {YfmWrapper} from '../../../../components/YfmWrapper/YfmWrapper';
import {DL} from '../../../../constants/common';
import {getSdk} from '../../../../libs/schematic-sdk';
import Fetch from '../Fetch/Fetch';

import {fetchEditorDocumentation} from './helpers';

import './Documentation.scss';

const b = block('documentation');
const i18n = I18n.keyset('editor.docs.view');
const DOCS_URL_ORIGIN = DL.ENDPOINTS.chartsDocs;

function prepareDocs(html, path) {
    const getDocPathPrefix = registry.common.functions.get('getDocPathPrefix');
    const prefix = getDocPathPrefix();

    const baseUrl = DOCS_URL_ORIGIN + path.slice(prefix.length);
    return html.replace(/href="((?:(?!http|"|#).)*)"/g, (_, p1) => {
        const url = new URL(p1, baseUrl);
        return `href="${url}"`;
    });
}

function formTabs(docs) {
    return docs.map(({title, path}) => ({
        title: i18n(title),
        id: path,
    }));
}

function DocFooterContent() {
    return (
        <React.Fragment>
            <hr />
            <Interpolate
                text={i18n('label_full-docs')}
                matches={{
                    link(match) {
                        return <a href={`${DOCS_URL_ORIGIN}`}>{match}</a>;
                    },
                }}
            />
            <hr />
        </React.Fragment>
    );
}

function BasicDocumentation({docs}) {
    const [tabs, setTabs] = React.useState([]);
    const [activeTab, changeActiveTab] = React.useState('');
    const [prevDocs, setPrevDocs] = React.useState(null);

    if (docs !== prevDocs) {
        const newTabs = formTabs(docs);
        setTabs(newTabs);
        changeActiveTab(newTabs[0] ? newTabs[0].id : '');
        setPrevDocs(docs);
    }

    return (
        <React.Fragment>
            <div className={b('panel')}>
                <div className={b('tabs')}>
                    <Tabs items={tabs} activeTab={activeTab} onSelectTab={changeActiveTab} />
                </div>
            </div>
            {activeTab && (
                <div className={b('docs')}>
                    <Fetch key={activeTab} fetch={() => fetchEditorDocumentation(activeTab)}>
                        {({data: {html}}) => (
                            <div className={b('docs-body')}>
                                <YfmWrapper
                                    className={b('docs-content')}
                                    setByInnerHtml={true}
                                    content={prepareDocs(html, activeTab)}
                                    noMagicLinks={true}
                                />
                                <YfmWrapper
                                    className={b('docs-footer')}
                                    content={DocFooterContent}
                                    noMagicLinks={true}
                                />
                            </div>
                        )}
                    </Fetch>
                </div>
            )}
        </React.Fragment>
    );
}

BasicDocumentation.propTypes = {
    docs: PropTypes.array,
};

function ModuleDocumentation({module}) {
    const {key} = module;
    const docsField = `documentation_${window.DL.user.lang}`;

    function renderMarkdown(data) {
        const text = data[docsField];
        if (!text) {
            return <div className={b('no-docs')}>{i18n('label_no-module-docs')}</div>;
        }

        const fetchRenderedMarkdown = registry.common.functions.get('fetchRenderedMarkdown');

        return (
            <Fetch fetch={() => fetchRenderedMarkdown(text)}>
                {({data: {result}}) => (
                    <YfmWrapper
                        className={b('module-docs-content')}
                        setByInnerHtml={true}
                        content={result}
                        noMagicLinks={true}
                    />
                )}
            </Fetch>
        );
    }

    return (
        <React.Fragment>
            <div className={b('module-docs')}>
                <Fetch fetch={() => getSdk().sdk.us.getEntryByKey({key})}>
                    {({data}) => renderMarkdown(data.data)}
                </Fetch>
            </div>
        </React.Fragment>
    );
}

ModuleDocumentation.propTypes = {
    module: PropTypes.object,
};

function Documentation({docs, module}) {
    return (
        <div className={b()}>
            {module ? <ModuleDocumentation module={module} /> : <BasicDocumentation docs={docs} />}
        </div>
    );
}

Documentation.propTypes = {
    docs: PropTypes.arrayOf(
        PropTypes.shape({
            title: PropTypes.string.isRequired,
            path: PropTypes.string.isRequired,
        }),
    ),
    module: PropTypes.shape({
        key: PropTypes.string.isRequired,
    }),
};

export default Documentation;
