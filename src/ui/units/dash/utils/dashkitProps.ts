import type {DashKitGroup} from '@gravity-ui/dashkit';

export const getPropertiesWithResizeHandles: DashKitGroup['gridProperties'] = (props) => ({
    ...props,
    resizeHandles: ['sw', 'se'],
});
