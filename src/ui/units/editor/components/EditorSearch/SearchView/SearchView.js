import React, {useState} from 'react';

import {ChevronDown, ChevronRight} from '@gravity-ui/icons';
import {Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import PropTypes from 'prop-types';

import {ACTION_TYPE, useEditorSearchStore} from '../state';

import './SearchView.scss';

const b = block('editor-search-view');
const i18n = I18n.keyset('component.editor-search.view');
const MAX_SYMBOLS_BEFORE = 30;

function wrapLine({range, line}) {
    const [, startColumn, , endColumn] = range;
    const leftPart = line.slice(0, startColumn - 1);
    return (
        leftPart.slice(-MAX_SYMBOLS_BEFORE) +
        `<span class=${b('decoration')}>${line.slice(startColumn - 1, endColumn - 1)}</span>` +
        line.slice(endColumn - 1)
    );
}

function Item({range, line, id, index}) {
    const {dispatchAction, state} = useEditorSearchStore();
    const {highlightLine} = state;

    function onClick() {
        dispatchAction(ACTION_TYPE.OPEN_FOUND, {id, range, index});
    }
    const isHighlight = highlightLine && highlightLine.id === id && highlightLine.index === index;

    return (
        <div className={b('matched-item', {highlight: isHighlight})} onClick={onClick}>
            <div
                className={b('matched-item-text')}
                dangerouslySetInnerHTML={{__html: wrapLine({range, line})}}
            />
        </div>
    );
}

Item.propTypes = {
    id: PropTypes.string,
    range: PropTypes.arrayOf(PropTypes.number),
    line: PropTypes.string,
    index: PropTypes.number,
};

function Group({name, matches, id}) {
    const len = matches.length;
    const [isOpen, toggleOpen] = useState(len < 10);

    return (
        <div className={b('group')}>
            <div className={b('group-header')} onClick={() => toggleOpen(!isOpen)}>
                <Icon
                    data={isOpen ? ChevronDown : ChevronRight}
                    width="16"
                    height="16"
                    className={b('icon-chevron')}
                />
                <div className={b('group-title')}>{name}</div>
                <div className={b('match-count')}>{len}</div>
            </div>
            {isOpen && (
                <div className={b('matches-list')}>
                    {matches.map(({range, line}, i) => (
                        <Item key={i} id={id} range={range} line={line} index={i} />
                    ))}
                </div>
            )}
        </div>
    );
}

Group.propTypes = {
    id: PropTypes.string,
    name: PropTypes.string,
    matches: PropTypes.arrayOf(
        PropTypes.shape({
            range: PropTypes.arrayOf(PropTypes.number),
            line: PropTypes.string,
        }),
    ),
};

function SearchView({className}) {
    const {state} = useEditorSearchStore();
    const {searchMatches} = state;

    return (
        <div className={b(false, className)}>
            {state.isFound === false && (
                <div className={b('not-found')}>{i18n('label_not-found-search')}</div>
            )}
            {searchMatches.map(({id, name, matches}) => {
                return (
                    matches.length !== 0 && <Group key={id} id={id} name={name} matches={matches} />
                );
            })}
        </div>
    );
}

SearchView.propTypes = {
    className: PropTypes.string,
};

export default SearchView;
