import {AxiosError} from 'axios';
// @ts-ignore
import sha1 from 'js-sha1';
import {LabelsPositions, Shared, getSortedData} from 'shared';

import {ResetWizardStoreAction} from '../actions';
import {
    RECEIVE_WIDGET,
    SET_EXTRA_SETTINGS,
    SET_WIDGET_LOAD_STATUS,
    WidgetAction,
    WidgetData,
} from '../actions/widget';
import {versionExtractor} from '../utils/helpers';

export interface WidgetState {
    isLoading: boolean;
    widget: WidgetData;
    extraSettings?: Shared['extraSettings'];
    hash: string;
    error: AxiosError | undefined;
}

const initialState: WidgetState = {
    isLoading: false,
    widget: null,
    extraSettings: {
        title: '',
        titleMode: 'show',
        labelsPosition: LabelsPositions.Outside,
    },
    hash: '',
    error: undefined,
};

export function widget(
    state = initialState,
    action: WidgetAction | ResetWizardStoreAction,
): WidgetState {
    switch (action.type) {
        case SET_WIDGET_LOAD_STATUS: {
            const {isLoading} = action;
            return {
                ...state,
                isLoading,
            };
        }

        case RECEIVE_WIDGET: {
            const {data, error} = action;

            if (data) {
                let widgetData;
                if (data.data.shared) {
                    widgetData = JSON.parse(data.data.shared);
                } else {
                    widgetData = data.data;
                }

                widgetData = {
                    ...widgetData,
                };

                const sortedWidgetData = getSortedData(widgetData);
                const version = JSON.stringify(sortedWidgetData, versionExtractor);
                const hash = sha1(version);

                return {
                    ...state,
                    widget: data,
                    extraSettings: widgetData.extraSettings || {
                        title: '',
                        titleMode: 'show',
                    },
                    hash,
                };
            } else {
                return {
                    ...state,
                    error,
                };
            }
        }

        case SET_EXTRA_SETTINGS: {
            const {extraSettings} = action;

            return {
                ...state,
                extraSettings,
            };
        }

        default:
            return state;
    }
}
