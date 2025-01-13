import React from 'react';

import {Button, Flex} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {EntryTitle} from 'components/EntryTitle';
import {i18n} from 'i18n';
import PropTypes from 'prop-types';
import {DialogControlQa, EntryScope} from 'shared';
import {NavigationMinimal, PLACE, QUICK_ITEMS, Utils, sdk} from 'ui';
import WorkbookNavigationMinimal from 'ui/components/WorkbookNavigationMinimal/WorkbookNavigationMinimal';

import logger from '../../libs/logger';
import {getSdk} from '../../libs/schematic-sdk';
import Loader from '../../units/dash/components/Loader/Loader';
import {EntryTypeNode} from '../../units/dash/modules/constants';
import {getPersonalFolderPath} from '../../units/dash/modules/helpers';

import './DropdownNavigation.scss';

const SCOPE_TO_PLACE = {
    [EntryScope.Dataset]: PLACE.DATASETS,
    [EntryScope.Widget]: PLACE.WIDGETS,
    [EntryScope.Connection]: PLACE.CONNECTIONS,
};
const popupPlacement = [
    'right-start',
    'right',
    'right-end',
    'left-start',
    'left',
    'left-end',
    'bottom',
    'bottom-start',
    'bottom-end',
    'top',
    'top-start',
    'top-end',
];

const b = block('dropdown-navigation');

class DropdownNavigation extends React.PureComponent {
    static propTypes = {
        entryId: PropTypes.string,
        disabled: PropTypes.bool,
        onUpdate: PropTypes.func,
        onClick: PropTypes.func.isRequired,
        scope: PropTypes.oneOf(Object.values(EntryScope)).isRequired,
        includeClickableType: PropTypes.oneOf(Object.values(EntryTypeNode)),
        excludeClickableType: PropTypes.oneOf(Object.values(EntryTypeNode)),
        size: PropTypes.string,
        navigationPath: PropTypes.string.isRequired,
        changeNavigationPath: PropTypes.func.isRequired,
        error: PropTypes.bool,
    };

    static defaultProps = {size: 'l'};

    static getDerivedStateFromProps({entryId}, {prevEntryId}) {
        return entryId === prevEntryId ? null : {entry: null};
    }

    state = {
        prevEntryId: null,
        entry: null,
        showNavigation: false,
    };

    componentDidMount() {
        this.update();
    }

    componentDidUpdate() {
        this.update();
    }

    buttonRef = React.createRef();

    get loading() {
        return this.props.entryId && this.props.entryId !== this.state.prevEntryId;
    }

    async update() {
        const entryId = this.props.entryId;
        const state = {prevEntryId: entryId};
        let isValidEntry = false;

        if (this.loading) {
            try {
                const entryMeta = await getSdk()
                    .sdk.us.getEntry({entryId})
                    .then((metaData) => {
                        isValidEntry = true;
                        return metaData;
                    });
                state.entry = entryMeta;

                if (this.props.onUpdate) {
                    this.props.onUpdate({
                        selectedWidgetType: entryMeta.type.match(/^[^_]*/)[0],
                        entryMeta,
                        isValidEntry,
                    });
                }
            } catch (error) {
                logger.logError('DropdownNavigation: getEntryMeta failed', error);
                console.error('DROPDOWN_NAVIGATION_GET_ENTRY', error);
            }
        }

        this.setState(state);
    }

    renderNavigation() {
        if (this.props.workbookId) {
            return (
                <WorkbookNavigationMinimal
                    workbookId={this.props.workbookId}
                    hasTail={true}
                    anchor={this.buttonRef}
                    onClose={() => this.setState({showNavigation: false})}
                    visible={this.state.showNavigation}
                    popupPlacement={popupPlacement}
                    scope={this.props.scope}
                    clickableScope={this.props.scope}
                    onEntryClick={(entry) => {
                        this.props.onClick({entry});
                        this.setState({entry, showNavigation: false});
                    }}
                    includeClickableType={this.props.includeClickableType}
                    excludeClickableType={this.props.excludeClickableType}
                />
            );
        }

        return (
            <NavigationMinimal
                sdk={sdk}
                startFrom={
                    this.state.entry
                        ? Utils.getNavigationPathFromKey(this.state.entry.key)
                        : this.props.navigationPath || getPersonalFolderPath()
                }
                hasTail={true}
                anchor={this.buttonRef}
                onClose={() => this.setState({showNavigation: false})}
                visible={this.state.showNavigation}
                popupPlacement={popupPlacement}
                scope={this.props.scope}
                clickableScope={this.props.scope}
                placeSelectParameters={{
                    items: [PLACE.ROOT, PLACE.FAVORITES, SCOPE_TO_PLACE[this.props.scope]],
                    quickItems: [QUICK_ITEMS.USER_FOLDER],
                }}
                ignoreWorkbookEntries={true}
                includeClickableType={this.props.includeClickableType}
                excludeClickableType={this.props.excludeClickableType}
                onEntryClick={(entry) => {
                    this.props.onClick({entry});
                    this.props.changeNavigationPath(Utils.getNavigationPathFromKey(entry.key));
                    this.setState({entry, showNavigation: false});
                }}
            />
        );
    }

    render() {
        if (this.loading) {
            return (
                <div className={b()}>
                    <Loader size="s" />
                </div>
            );
        }

        const width = this.state.entry ? 'max' : undefined;

        const defaultView = this.props.error ? 'outlined-danger' : 'outlined-action';
        const view = this.state.entry ? 'outlined' : defaultView;

        return (
            <div className={b()} ref={this.buttonRef}>
                <Button
                    view={view}
                    width={width}
                    size={this.props.size}
                    disabled={this.props.disabled}
                    onClick={() => this.setState({showNavigation: !this.state.showNavigation})}
                    className={b('button')}
                    qa={DialogControlQa.selectDatasetButton}
                >
                    <Flex>
                        {this.state.entry ? (
                            <EntryTitle entry={this.state.entry} theme="inline" />
                        ) : (
                            i18n('dash.navigation-input.edit', 'button_choose')
                        )}
                    </Flex>
                </Button>
                {this.renderNavigation()}
            </div>
        );
    }
}

export default DropdownNavigation;
