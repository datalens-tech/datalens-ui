import React from 'react';

import {Button, Flex} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {i18n} from 'i18n';
import PropTypes from 'prop-types';
import {EntryScope, NavigationInputQA} from 'shared';
import {Utils} from 'ui';

import DropdownNavigation from '../../../../components/DropdownNavigation/DropdownNavigation';
import {EntryTypeNode} from '../../modules/constants';
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
        includeClickableType: PropTypes.oneOf(Object.values(EntryTypeNode)),
        excludeClickableType: PropTypes.oneOf(Object.values(EntryTypeNode)),
        linkMixin: PropTypes.string,
        navigationMixin: PropTypes.string,
        scope: PropTypes.oneOf(Object.values(EntryScope)),
        isInvalid: PropTypes.bool,
        getEntryLink: PropTypes.func,
        navigationPath: PropTypes.string,
        changeNavigationPath: PropTypes.func,
    };

    static getDerivedStateFromProps({entryId}, {prevEntryId}) {
        return entryId === prevEntryId
            ? null
            : {
                  prevEntryId: entryId,
                  showInput: false,
              };
    }

    state = {isValidEntry: false};

    onChange = ({entry, params}) => {
        const {entryId, key} = entry;
        this.props.onChange({entryId, name: Utils.getEntryNameFromKey(key), params});
    };

    onEntryUpdate = (entryData) => {
        this.setState({isValidEntry: entryData.isValidEntry});
        if (this.props.onUpdate) {
            this.props.onUpdate(entryData);
        }
    };

    render() {
        const {
            entryId,
            includeClickableType,
            excludeClickableType,
            workbookId,
            navigationPath,
            navigationMixin,
            changeNavigationPath,
            linkMixin,
            scope = EntryScope.Widget,
            isInvalid,
            getEntryLink,
        } = this.props;
        const {showInput, isValidEntry} = this.state;
        const showOpenButton = isValidEntry && entryId && !isInvalid;

        const href = getEntryLink ? getEntryLink(entryId) : getChartEditLink(entryId);

        return (
            <React.Fragment>
                <div className={b('row', navigationMixin)}>
                    <DropdownNavigation
                        size="m"
                        entryId={entryId}
                        scope={scope}
                        onClick={this.onChange}
                        onUpdate={this.onEntryUpdate}
                        includeClickableType={includeClickableType}
                        excludeClickableType={excludeClickableType}
                        error={isInvalid}
                        workbookId={workbookId}
                        navigationPath={navigationPath}
                        changeNavigationPath={changeNavigationPath}
                    />
                    {showOpenButton && (
                        <Button
                            className={b('button')}
                            qa={NavigationInputQA.Open}
                            target="_blank"
                            href={href}
                        >
                            {i18n('dash.navigation-input.edit', 'button_open')}
                        </Button>
                    )}
                </div>
                <Flex gap={2} className={b('row', linkMixin)}>
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
                            scope={scope}
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
                </Flex>
            </React.Fragment>
        );
    }
}

export default NavigationInput;
