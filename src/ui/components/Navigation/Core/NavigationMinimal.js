import React from 'react';

import {Lock} from '@gravity-ui/icons';
import {Button, Icon, Popup} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import {I18n} from 'i18n';
import isEqual from 'lodash/isEqual';
import noop from 'lodash/noop';
import PropTypes from 'prop-types';
import {DlNavigationQA} from 'shared';

import {Scope} from '../../../constants/common';
import {MODE_MINIMAL, PLACE} from '../constants';

import {NavigationBreadcrumbs} from './NavigationBreadcrumbs/NavigationBreadcrumbs';
import NavigationEntries from './NavigationEntries';

import './NavigationMinimal.scss';

const i18n = I18n.keyset('component.navigation.view');
const b = cn('dl-core-navigation-minimal');

class NavigationMinimal extends React.Component {
    static propTypes = {
        anchor: PropTypes.any,
        popupPlacement: PropTypes.array,
        hasTail: PropTypes.bool,
        visible: PropTypes.bool,
        path: PropTypes.string,
        className: PropTypes.string,
        clickableScope: PropTypes.string,
        onClose: PropTypes.func,
        onChooseFolder: PropTypes.func,
        onCrumbClick: PropTypes.func,
        getPlaceParameters: PropTypes.func.isRequired,
        placeSelectNode: PropTypes.element,
        place: PropTypes.string,
        onPermissionError: PropTypes.func,
    };

    static defaultProps = {
        hasTail: false,
        popupPlacement: ['bottom-start'],
        onChooseFolder: noop,
        place: PLACE.ROOT,
    };

    static getDerivedStateFromProps(props, state) {
        const {visible} = props;
        if (props.visible === state.visible) {
            return null;
        }
        return {
            visible,
        };
    }

    state = {
        breadCrumbs: [],
    };

    refEntries = React.createRef();

    refresh() {
        if (this.refEntries.current) {
            this.refEntries.current.refresh();
        }
    }

    onClose = (event) => {
        if (document.body.contains(event.target)) {
            this.props.onClose(event);
        }
    };

    onChooseFolder = (event) => {
        if (!this.refEntries.current.state.isLoading) {
            this.props.onChooseFolder(this.props.path);
            this.props.onClose(event);
        }
    };

    setBreadCrumbs = (breadCrumbs) => {
        if (!isEqual(this.state.breadCrumbs, breadCrumbs)) {
            this.setState({breadCrumbs});
        }
    };

    renderFooter() {
        const {breadCrumbs} = this.state;
        const lastBreadCrumb = breadCrumbs[breadCrumbs.length - 1];
        const canEditInCurrentFolder =
            breadCrumbs.length === 0 ||
            Boolean(
                lastBreadCrumb &&
                    lastBreadCrumb.permissions &&
                    lastBreadCrumb.permissions.edit === true,
            );
        const isNavPlace = this.props.place === PLACE.ROOT;
        const disabledAccept = !isNavPlace || !canEditInCurrentFolder;
        const hasIconLock = isNavPlace && !canEditInCurrentFolder;

        return (
            <div className={b('footer')}>
                <div className={b('button-place')}>
                    <Button
                        view="flat"
                        width="max"
                        size="l"
                        onClick={this.onClose}
                        className={b('button-cancel')}
                        pin="brick-brick"
                    >
                        {i18n('button_cancel')}
                    </Button>
                </div>
                <div className={b('button-place')}>
                    <Button
                        view="action"
                        width="max"
                        size="l"
                        onClick={this.onChooseFolder}
                        className={b('button-done')}
                        disabled={disabledAccept}
                        pin="brick-brick"
                        qa={DlNavigationQA.MinimalDoneBtn}
                    >
                        {hasIconLock && <Icon data={Lock} />}
                        {i18n('button_done')}
                    </Button>
                </div>
            </div>
        );
    }

    render() {
        const {popupPlacement, anchor, visible, hasTail, clickableScope, className} = this.props;

        if (!anchor.current) {
            return null;
        }

        const hasButtonsChoose = clickableScope === Scope.Folder;

        return (
            <Popup
                hasArrow={hasTail}
                placement={popupPlacement}
                onOpenChange={(open, event) => {
                    if (!open) {
                        this.onClose(event);
                    }
                }}
                open={visible}
                anchorElement={anchor.current}
            >
                {visible && (
                    <div className={b(null, className)} data-qa={DlNavigationQA.NavigationMinimal}>
                        {this.props.place === PLACE.ROOT && (
                            <div className={b('header')}>
                                <div className={b('controls')}>
                                    <NavigationBreadcrumbs
                                        breadCrumbs={this.state.breadCrumbs}
                                        place={this.props.place}
                                        getPlaceParameters={this.props.getPlaceParameters}
                                        onClick={this.props.onCrumbClick}
                                        enableMenu={false}
                                    />
                                </div>
                            </div>
                        )}
                        {this.props.placeSelectNode}
                        <NavigationEntries
                            ref={this.refEntries}
                            {...this.props}
                            mode={MODE_MINIMAL}
                            getPlaceParameters={this.props.getPlaceParameters}
                            setBreadCrumbs={this.setBreadCrumbs}
                            onPermissionError={this.props.onPermissionError}
                        />
                        {hasButtonsChoose && this.renderFooter()}
                    </div>
                )}
            </Popup>
        );
    }
}

export default NavigationMinimal;
