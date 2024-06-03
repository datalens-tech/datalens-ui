import type {Status} from '../../../constants/common';

export const PREVIEW_DRAW = Symbol('editor/chart/PREVIEW_DRAW');
type DrawPreviewAction = {
    type: typeof PREVIEW_DRAW;
};
export const drawPreview = (): DrawPreviewAction => ({
    type: PREVIEW_DRAW,
});

export const CHART_SET_LOADED_DATA = Symbol('editor/chart/CHART_SET_LOADED_DATA');
type SetChartLoadedDataAction = {
    type: typeof CHART_SET_LOADED_DATA;
    payload:
        | {
              status: Status.Success;
              data: {
                  loadedData: {
                      logs_v2?: string;
                  };
              };
          }
        | {
              status: Status.Failed;
              data: {
                  loadedData?: {
                      logs_v2?: string;
                  };
              };
              error?: {
                  extra?: {
                      logs_v2?: string;
                  };
                  details?: {
                      stackTrace?: string;
                  };
              };
          };
};
export const setChartLoadedData = (
    payload: SetChartLoadedDataAction['payload'],
): SetChartLoadedDataAction => ({
    type: CHART_SET_LOADED_DATA,
    payload,
});

export type ChartActions = DrawPreviewAction | SetChartLoadedDataAction;
