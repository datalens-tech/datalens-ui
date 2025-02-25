import type {TableColumnConfig} from '@gravity-ui/uikit';
import type {ListUser} from 'shared/schema/auth/types/users';

export type GetUsersListColumns = () => TableColumnConfig<ListUser>[];
