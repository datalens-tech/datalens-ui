import React from 'react';

import {Button} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {EntryTitle} from 'components/EntryTitle';
import {i18n} from 'i18n';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {NavigationMinimal, PLACE, QUICK_ITEMS, Utils, sdk} from 'ui';
import WorkbookNavigationMinimal from 'ui/components/WorkbookNavigationMinimal/WorkbookNavigationMinimal';

import logger from '../../../../libs/logger';
import {getSdk} from '../../../../libs/schematic-sdk';
import Loader from '../../components/Loader/Loader';
import {ENTRY_SCOPE, ENTRY_TYPE} from '../../modules/constants';
import {getPersonalFolderPath} from '../../modules/helpers';
import {changeNavigationPath} from '../../store/actions/dashTyped';

import './DropdownNavigation.scss';

const SCOPE_TO_PLACE = {
    [ENTRY_SCOPE.DATASET]: PLACE.DATASETS,
    [ENTRY_SCOPE.WIDGET]: PLACE.WIDGETS,
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
        scope: PropTypes.oneOf(Object.values(ENTRY_SCOPE)).isRequired,
        includeClickableType: PropTypes.oneOf(Object.values(ENTRY_TYPE)),
        excludeClickableType: PropTypes.oneOf(Object.values(ENTRY_TYPE)),
        size: PropTypes.string,
        navigationPath: PropTypes.string.isRequired,
        changeNavigationPath: PropTypes.func.isRequired,
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

        if (this.loading) {
            try {
                const entryMeta = await getSdk().us.getEntryMeta({entryId});
                state.entry = entryMeta;

                if (this.props.onUpdate) {
                    this.props.onUpdate(entryMeta.type.match(/^[^_]*/)[0], entryMeta);
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

        return (
            <div className={b()} ref={this.buttonRef}>
                <Button
                    view="outlined"
                    width={width}
                    size={this.props.size}
                    disabled={this.props.disabled}
                    onClick={() => this.setState({showNavigation: !this.state.showNavigation})}
                    ref={this.setButtonRef}
                    className={b('button')}
                >
                    {this.state.entry ? (
                        <EntryTitle entry={this.state.entry} theme="inline" />
                    ) : (
                        i18n('dash.navigation-input.edit', 'button_choose')
                    )}
                </Button>
                {this.renderNavigation()}
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    navigationPath: state.dash.navigationPath,
    workbookId: state.dash.entry?.workbookId,
});

const mapDispatchToProps = {
    changeNavigationPath,
};

export default connect(mapStateToProps, mapDispatchToProps)(DropdownNavigation);
