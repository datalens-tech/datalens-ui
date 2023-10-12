import React from 'react';

import {Button} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {i18n} from 'i18n';
import PropTypes from 'prop-types';
import {NavigationInputQA} from 'shared';
import {Utils} from 'ui';

import DropdownNavigation from '../../containers/DropdownNavigation/DropdownNavigation';
import {ENTRY_SCOPE, ENTRY_TYPE} from '../../modules/constants';
import {getChartEditLink} from '../../modules/helpers';

import InputLink from './InputLink/InputLink';

import './NavigationInput.scss';

const b = block('navigation-input');

class NavigationInput extends React.PureComponent {
    static propTypes = {
        entryId: PropTypes.string,
        workbookId: PropTypes.string,
        onUpdate: PropTypes.func,
        onChange: PropTypes.func.isRequired,
        includeClickableType: PropTypes.oneOf(Object.values(ENTRY_TYPE)),
        excludeClickableType: PropTypes.oneOf(Object.values(ENTRY_TYPE)),
        linkMixin: PropTypes.string,
        navigationMixin: PropTypes.string,
    };

    static getDerivedStateFromProps({entryId}, {prevEntryId}) {
        return entryId === prevEntryId
            ? null
            : {
                  prevEntryId: entryId,
                  showInput: false,
              };
    }

    state = {};

    onChange = ({entry, params}) => {
        const {entryId, key} = entry;
        this.props.onChange({entryId, name: Utils.getEntryNameFromKey(key), params});
    };

    render() {
        const {
            entryId,
            onUpdate,
            includeClickableType,
            excludeClickableType,
            workbookId,
            navigationMixin,
            linkMixin,
        } = this.props;
        const {showInput} = this.state;

        return (
            <React.Fragment>
                <div className={b('row', navigationMixin)}>
                    <div className={b('navigation')}>
                        <DropdownNavigation
                            size="m"
                            entryId={entryId}
                            scope={ENTRY_SCOPE.WIDGET}
                            onClick={this.onChange}
                            onUpdate={onUpdate}
                            includeClickableType={includeClickableType}
                            excludeClickableType={excludeClickableType}
                        />
                    </div>
                    {entryId && (
                        <Button
                            className={b('button')}
                            qa={NavigationInputQA.Open}
                            target="_blank"
                            href={getChartEditLink(entryId)}
                        >
                            {i18n('dash.navigation-input.edit', 'button_open')}
                        </Button>
                    )}
                </div>
                <div className={b('row', linkMixin)}>
                    {showInput ? (
                        <InputLink
                            onApply={({entry, params}) => {
                                this.onChange({entry, params});
                                this.setState({showInput: false});
                            }}
                            onCancel={() => this.setState({showInput: false})}
                            includeType={includeClickableType}
                            excludeType={excludeClickableType}
                            workbookId={workbookId}
                        />
                    ) : (
                        <Button
                            className={b('button')}
                            qa={NavigationInputQA.Link}
                            view="outlined"
                            size="m"
                            onClick={() => this.setState({showInput: !showInput})}
                        >
                            {i18n('dash.navigation-input.edit', 'button_use-link')}
                        </Button>
                    )}
                </div>
            </React.Fragment>
        );
    }
}

export default NavigationInput;
