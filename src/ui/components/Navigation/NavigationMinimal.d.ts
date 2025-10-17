import React from 'react';

import type {PopupPlacement} from '@gravity-ui/uikit';

import type {NavigationEntry} from '../../../shared/schema';
import type SDK from '../../libs/sdk';

import type {ResolvePathMode} from './types';

export interface NavigationMinimalProps {
    sdk: SDK;
    onClose: (event: any) => void;
    visible: boolean;
    startFrom?: string;
    onEntryClick?: (entry: NavigationEntry) => void;
    scope?: string;
    ignoreWorkbookEntries?: boolean;
    clickableScope?: string;
    hasTail?: boolean;
    anchor?: React.RefObject<HTMLElement>;
    popupPlacement?: PopupPlacement;
    onChooseFolder?: (key?: string) => void;
    inactiveEntryKeys?: string[];
    placeSelectParameters?: {
        items: string[];
        quickItems: string[];
    };
    includeClickableType?: string | string[];
    excludeClickableType?: string | string[];
    inactiveEntryIds?: string[];
    resolvePathMode?: ResolvePathMode;
    canCreateFolder?: boolean;
}

export default class NavigationMinimal extends React.Component<NavigationMinimalProps> {}
