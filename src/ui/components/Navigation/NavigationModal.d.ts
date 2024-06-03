import React from 'react';

import type SDK from '../../libs/sdk';

import type {CurrentPageEntry, ResolvePathMode} from './types';

export interface NavigationModalProps {
    sdk: SDK;
    startFrom?: string;
    onClose: () => void;
    visible: boolean;
    currentPageEntry?: CurrentPageEntry;
    resolvePathMode?: ResolvePathMode;
}

export default class NavigationModal extends React.PureComponent<NavigationModalProps> {}
