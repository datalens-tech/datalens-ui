import type {ValueOf} from '../..';
import type {NOTIFICATION_LEVEL, PROCESS_STATUS} from '../../constants/meta-manager';

export type ProcessStatus = ValueOf<typeof PROCESS_STATUS>;

export type NotificationLevel = ValueOf<typeof NOTIFICATION_LEVEL>;
