import React from 'react';

import {Magnifier} from '@gravity-ui/icons';
import {Button, Icon, TextInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import PropTypes from 'prop-types';
import {KeyCodes} from 'ui';

import {MATCH_CASE} from '../constants';
import {ACTION_TYPE, useEditorSearchStore} from '../state';

import './SearchPanel.scss';

const b = block('editor-search-panel');
const i18n = I18n.keyset('component.editor-search.view');

function SearchPanel({className}) {
    const {state, setState, dispatchAction} = useEditorSearchStore();
    const {searchText, matchCase} = state;

    function onChange(text) {
        setState({searchText: text});
    }

    function onSearch() {
        if (searchText) {
            dispatchAction(ACTION_TYPE.SEARCH);
        }
    }

    function onKeyDown(event) {
        if (event.keyCode === KeyCodes.ENTER) {
            onSearch();
        }
    }

    function toggleMatchCase() {
        setState({
            matchCase: matchCase === MATCH_CASE.LOWER ? MATCH_CASE.SENSITIVE : MATCH_CASE.LOWER,
        });
    }

    return (
        <div className={b(false, className)}>
            <TextInput
                size="m"
                placeholder={i18n('label_placeholder-search')}
                value={searchText}
                onUpdate={onChange}
                pin="round-clear"
                onKeyDown={onKeyDown}
            />
            <Button
                className={b('btn-match-case')}
                view={matchCase === MATCH_CASE.LOWER ? 'outlined' : 'outlined-info'}
                size="s"
                pin="brick-brick"
                onClick={toggleMatchCase}
                title={i18n('button_match-case-title')}
            >
                Aa
            </Button>
            <Button
                className={b('btn-search')}
                view="action"
                size="s"
                pin="brick-round"
                onClick={onSearch}
            >
                <Icon data={Magnifier} width="14" height="14" className={b('icon-loupe')} />
            </Button>
        </div>
    );
}

SearchPanel.propTypes = {
    className: PropTypes.string,
};

export default SearchPanel;
