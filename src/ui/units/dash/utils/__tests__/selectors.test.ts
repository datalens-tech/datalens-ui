import {isEnabledFeature} from 'ui/utils/isEnabledFeature';

import {isGlobalWidgetVisibleByMainSetting, isGroupItemVisibleOnTab} from '../selectors';

jest.mock('ui/utils/isEnabledFeature');
const mockIsEnabledFeature = isEnabledFeature as jest.MockedFunction<typeof isEnabledFeature>;

describe('dash selectors utils', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockIsEnabledFeature.mockReturnValue(true);
    });
    describe('isGlobalWidgetVisibleByMainSetting', () => {
        it('should return true when groupImpactType is undefined', () => {
            const result = isGlobalWidgetVisibleByMainSetting('tab1', undefined);
            expect(result).toBe(true);
        });
    });

    describe('isGroupItemVisibleOnTab', () => {
        it('should return true for allTabs impact type', () => {
            const item = {impactType: 'allTabs' as const};
            const result = isGroupItemVisibleOnTab({item, tabId: 'tab1'});
            expect(result).toBe(true);
        });

        it('should return true when tab is in selectedTabs list', () => {
            const item = {impactType: 'selectedTabs' as const, impactTabsIds: ['tab1', 'tab2']};
            const result = isGroupItemVisibleOnTab({item, tabId: 'tab1'});
            expect(result).toBe(true);
        });

        it('should return false when tab is not in selectedTabs list', () => {
            const item = {impactType: 'selectedTabs' as const, impactTabsIds: ['tab1', 'tab2']};
            const result = isGroupItemVisibleOnTab({item, tabId: 'tab3'});
            expect(result).toBe(false);
        });

        it('should return true when tab matches currentTab impact type', () => {
            const item = {impactType: 'currentTab' as const, impactTabsIds: ['tab1']};
            const result = isGroupItemVisibleOnTab({item, tabId: 'tab1'});
            expect(result).toBe(true);
        });

        it('should return false when tab does not match currentTab impact type', () => {
            const item = {impactType: 'currentTab' as const, impactTabsIds: ['tab1']};
            const result = isGroupItemVisibleOnTab({item, tabId: 'tab2'});
            expect(result).toBe(false);
        });

        const mockItem = {
            impactType: 'selectedTabs' as const,
            impactTabsIds: ['tab1', 'tab2'],
        };

        it('should return true when item has direct impact on tab', () => {
            const result = isGroupItemVisibleOnTab({
                item: mockItem,
                tabId: 'tab1',
            });
            expect(result).toBe(true);
        });

        it('should return false when item has no impact on tab', () => {
            mockIsEnabledFeature.mockReturnValue(true);
            const result = isGroupItemVisibleOnTab({
                item: mockItem,
                tabId: 'tab3',
            });
            expect(result).toBe(false);
        });

        it('should return true when item uses group setting and group is available', () => {
            mockIsEnabledFeature.mockReturnValue(true);
            const itemWithGroupSetting = {
                impactType: 'asGroup' as const,
            };
            const result = isGroupItemVisibleOnTab({
                item: itemWithGroupSetting,
                tabId: 'tab1',
                groupImpactType: 'allTabs',
            });
            expect(result).toBe(true);
        });

        it('should return false when item uses group setting but group is not available', () => {
            mockIsEnabledFeature.mockReturnValue(true);
            const itemWithGroupSetting = {
                impactType: 'asGroup' as const,
            };
            const result = isGroupItemVisibleOnTab({
                item: itemWithGroupSetting,
                tabId: 'tab3',
                groupImpactType: 'selectedTabs',
                groupImpactTabsIds: ['tab1', 'tab2'],
            });
            expect(result).toBe(false);
        });

        it('should prioritize item impact over group setting', () => {
            mockIsEnabledFeature.mockReturnValue(true);
            const itemWithDirectImpact = {
                impactType: 'selectedTabs' as const,
                impactTabsIds: ['tab1'],
            };
            const result = isGroupItemVisibleOnTab({
                item: itemWithDirectImpact,
                tabId: 'tab1',
                groupImpactType: 'selectedTabs',
                groupImpactTabsIds: ['tab2'], // group doesn't include tab1, but item does
            });
            expect(result).toBe(true);
        });
    });
});
