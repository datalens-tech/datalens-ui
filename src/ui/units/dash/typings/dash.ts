import type {
    DashTabItemControl,
    DashTabItemGroupControl,
    DashTabItemGroupControlBaseData,
    DashTabItemType,
    ImpactTabsIds,
    ImpactType,
} from 'shared/types';

export enum DashUpdateStatus {
    Loading = 'loading',
    Successed = 'successed',
    Failed = 'failed',
}

export type GroupGlobalItemData = Partial<DashTabItemGroupControlBaseData> & {
    group: {impactType?: ImpactType; impactTabsIds?: ImpactTabsIds}[];
};

export type GlobalItem =
    | {
          data: Partial<DashTabItemControl['data']>;
          type: DashTabItemType.Control;
      }
    | {
          data: GroupGlobalItemData;
          type: DashTabItemType.GroupControl;
      };

export type GlobalItemWithId =
    | Pick<DashTabItemControl, 'type' | 'data' | 'id'>
    | Pick<DashTabItemGroupControl, 'type' | 'data' | 'id'>;
