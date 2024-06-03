import type {DatasetField} from './dataset';
import type {Field} from './wizard';

export type UpdateAction =
    | 'add_field'
    | 'add'
    | 'update_field'
    | 'update'
    | 'delete'
    | 'delete_field';

export type CommonUpdateField<T extends DatasetField | Field> = Partial<T> & Pick<T, 'guid'>;

export type CommonUpdate<T extends DatasetField | Field> = T extends Field
    ? {
          action: UpdateAction;
          field: CommonUpdateField<T>;
          debug_info?: string;
          deleteUpdateAfterValidation?: boolean;
      }
    : {action: UpdateAction; field: CommonUpdateField<T>};
