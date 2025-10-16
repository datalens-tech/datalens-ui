import React from 'react';

import {ChevronRight} from '@gravity-ui/icons';
import type {PopupPlacement, TextInputProps} from '@gravity-ui/uikit';
import {Button, Icon, TextInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {EntryDialogQA, EntryScope, PLACE} from 'shared';

import {Scope} from '../../constants';
import {sdk} from '../../libs/sdk';
import {registry} from '../../registry';
import {EntityIcon} from '../EntityIcon/EntityIcon';
import {NavigationMinimal, getPathDisplayName} from '../Navigation';

import './PathSelect.scss';

const b = block('dl-path-select');
const i18n = I18n.keyset('component.path-select.view');
const popupPlacement: PopupPlacement = ['right', 'right-end', 'right-start'];

export interface PathSelectProps {
    defaultPath: string;
    withInput: boolean;
    onChoosePath: (path: string) => void;
    inputRef: TextInputProps['controlRef'];
    inputValue: TextInputProps['value'];
    placeholder: TextInputProps['placeholder'];
    onChangeInput: TextInputProps['onUpdate'];
    inputError: TextInputProps['error'];
    inactiveEntryIds?: string[];
    inactiveEntryKeys?: string[];
    size: TextInputProps['size'];
    className?: string;
    buttonClassName?: string;
    inputClassName?: string;
    entryScope?: EntryScope;
}

class PathSelect extends React.PureComponent<PathSelectProps> {
    static defaultProps: Partial<PathSelectProps> = {
        defaultPath: '/',
        withInput: true,
        inputValue: '',
        size: 'm',
    };

    state = {
        visibleNav: false,
    };

    btnPlaceRef = React.createRef<HTMLDivElement>();

    render() {
        const {getPlaceSelectParameters} = registry.common.functions.getAll();
        return (
            <React.Fragment>
                <div className={b(null, this.props.className)}>
                    <div
                        className={b('button-place', {withInput: this.props.withInput})}
                        ref={this.btnPlaceRef}
                    >
                        <Button
                            className={b('button', this.props.buttonClassName)}
                            width="max"
                            view="flat"
                            size={this.props.size}
                            onClick={this.onClick}
                            qa={EntryDialogQA.FolderSelect}
                        >
                            <span className={b('button-content')}>
                                <EntityIcon
                                    type="folder"
                                    size="l"
                                    iconSize={22}
                                    classMixin={b('icon-folder')}
                                />
                                <span className={b('path-text')}>{this.text}</span>
                                {this.props.withInput && (
                                    <Icon data={ChevronRight} className={b('icon-chevron')} />
                                )}
                            </span>
                        </Button>
                    </div>
                    {this.props.withInput && (
                        <TextInput
                            className={this.props.inputClassName}
                            error={this.props.inputError}
                            qa={EntryDialogQA.PathSelect}
                            size={this.props.size}
                            controlRef={this.props.inputRef}
                            onUpdate={this.props.onChangeInput}
                            placeholder={
                                this.props.placeholder || i18n('label_default-placeholder')
                            }
                            value={this.props.inputValue}
                            hasClear={true}
                            onFocus={this.onFocus}
                        />
                    )}
                    <NavigationMinimal
                        sdk={sdk}
                        visible={this.state.visibleNav}
                        startFrom={this.props.defaultPath}
                        onClose={this.onClose}
                        anchor={this.btnPlaceRef}
                        popupPlacement={popupPlacement}
                        clickableScope={Scope.Folder}
                        inactiveEntryKeys={this.props.inactiveEntryKeys}
                        inactiveEntryIds={this.props.inactiveEntryIds}
                        onChooseFolder={this.onChoosePath}
                        placeSelectParameters={getPlaceSelectParameters([
                            PLACE.ROOT,
                            PLACE.FAVORITES,
                        ])}
                        canCreateFolder={this.props.entryScope !== EntryScope.Folder}
                    />
                </div>
            </React.Fragment>
        );
    }

    onClose = () => this.setState({visibleNav: false});

    onClick = () => this.setState({visibleNav: !this.state.visibleNav});

    onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        e.currentTarget.select();
    };

    get text() {
        return getPathDisplayName({path: this.props.defaultPath});
    }

    onChoosePath = (path = '') => {
        this.props.onChoosePath(path);
    };
}

export default PathSelect;
