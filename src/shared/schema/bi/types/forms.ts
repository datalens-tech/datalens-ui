import type {
    ButtonProps,
    CheckboxProps,
    RadioButtonProps,
    RadioGroupProps,
    SelectOption,
    SelectProps,
    TextAreaProps,
    TextInputProps,
} from '@gravity-ui/uikit';

import type {CollapseProps} from '../../../../ui/components/Collapse/types';
import type {SimpleDatepickerProps} from '../../../../ui/components/common/SimpleDatepicker/types';
import type {MdbAvailableDatabase} from '../../../constants';
import type {ConnectionData} from '../../../types';
import type {OAuthApplication} from '../../types';

type MarkdownString = string;

export type BaseItem = {
    name: string;
    inner?: boolean;
    displayConditions?: ConnectionData;
};

export type BaseControlItem = {
    width?: 's' | 'm' | 'l' | 'auto' | number; // default 'auto'
    defaultValue?: string; // 'value1,value2, ...' in the case of multiple: true
    fakeValue?: string; // fills in the control, but does not participate in the form/initialForm/innerForm
    placeholder?: string;
    hintText?: MarkdownString;
    prepareValue?: (value: string) => string | boolean | null;
};

export type LabelItem = {
    id: 'label';
    text: string;
    align?: 'center' | 'start' | 'end';
    displayConditions?: ConnectionData;
    helpText?: MarkdownString;
};

type TextAreaControlProps = {multiline: true} & TextAreaProps;
type TextInputControlProps = {multiline?: undefined} & TextInputProps;
export type InputItemControlProps = TextAreaControlProps | TextInputControlProps;

export type InputItem = BaseItem &
    BaseControlItem & {
        id: 'input';
        controlProps?: InputItemControlProps;
    };

export type SelectItem = BaseItem &
    BaseControlItem & {
        id: 'select';
        // option.data?.description is occupied for meta information in the select option.
        availableValues?: SelectOption[];
        hintText?: MarkdownString;
        controlProps?: Partial<SelectProps>;
        loading?: boolean;
    };

export type RadioButtonItemOption = {
    text: string;
    value: string;
};

export type RadioButtonItem = BaseItem &
    Omit<BaseControlItem, 'placeholder'> & {
        id: 'radio_button';
        options: RadioButtonItemOption[];
        defaultValue?: string;
        hintText?: MarkdownString;
        controlProps?: Partial<RadioButtonProps>;
        beforeUpdate?: (nextValue: string) => void;
    };

export type RadioGroupItemOption = {
    content: {
        text: string;
        hintText?: MarkdownString;
    };
    value: string;
};

export type RadioGroupItem = BaseItem & {
    id: 'radio_group';
    options: RadioGroupItemOption[];
    defaultValue?: string;
    controlProps?: Partial<RadioGroupProps>;
};

export type CheckboxItem = BaseItem & {
    id: 'checkbox';
    text: string;
    defaultValue?: boolean;
    controlProps?: Partial<CheckboxProps>;
};

export type DatepickerItem = BaseItem &
    Omit<BaseControlItem, 'width'> & {
        id: 'datepicker';
        controlProps?: Partial<SimpleDatepickerProps>;
    };

export type PlainTextItem = Pick<BaseItem, 'displayConditions'> & {
    id: 'plain_text';
    text: string;
    hintText?: MarkdownString;
};

export type DescriptionItem = Pick<BaseItem, 'displayConditions'> & {
    id: 'description';
    text: MarkdownString;
};

export type FileInputItem = BaseItem & {
    id: 'file-input';
    controlProps?: Partial<ButtonProps>;
};

export type HiddenItem = BaseItem & {
    id: 'hidden';
    defaultValue?: ConnectionData[keyof ConnectionData];
};

export type ConnectorFormItem =
    | LabelItem
    | InputItem
    | SelectItem
    | RadioButtonItem
    | RadioGroupItem
    | CheckboxItem
    | DatepickerItem
    | PlainTextItem
    | DescriptionItem
    | FileInputItem
    | HiddenItem;

export type CustomizableRow = {
    items: ConnectorFormItem[];
};

export type OAuthTokenRowItem = Pick<BaseItem, 'displayConditions'> &
    Pick<BaseControlItem, 'fakeValue'> & {
        type: 'oauth';
        application: OAuthApplication;
        name?: string; // default 'token'
        labelText?: string;
        buttonText?: string;
        disabled?: boolean;
    };

export type OAuthTokenChytRowItem = Pick<BaseItem, 'displayConditions'> &
    Pick<BaseControlItem, 'fakeValue'> & {
        type: 'oauth_chyt';
        name?: string; // default 'token'
        disabled?: boolean;
    };

export type CacheTtlRowItem = Omit<BaseItem, 'inner'> & {
    type: 'cache_ttl_sec';
    labelText?: string;
    disabled?: boolean;
};

export type CountersRowItem = Omit<BaseItem, 'inner'> & {
    type: 'metrica_counter' | 'appmetrica_counter';
    labelText?: string;
    allowManualInput?: boolean;
    disabled?: boolean;
};

export type CollapseRowItem = BaseItem & {
    type: 'collapse';
    text: string;
    inner: true;
    componentProps?: Partial<CollapseProps>;
};

export type AccuracyRowItem = Omit<BaseItem, 'inner'> & {
    type: 'metrica_accuracy';
    name: string;
    disabled?: boolean;
};

export type MdbFormFillRowItem = Pick<BaseItem, 'displayConditions'> & {
    type: 'mdb_form_fill';
    disabled?: boolean;
};

export type MdbClusterRowItem = Pick<BaseItem, 'displayConditions'> & {
    type: 'mdb_cluster';
    name: string;
    dbType: MdbAvailableDatabase;
    disabled?: boolean;
};

export type MdbFieldRowItem = Pick<BaseItem, 'displayConditions'> & {
    type: 'mdb_host' | 'mdb_username' | 'mdb_database';
    dbType: MdbAvailableDatabase;
    disabled?: boolean;
};

export type CloudTreeSelectRowItem = BaseItem & {
    type: 'cloud_tree_select';
    disabled?: boolean;
};

export type ServiceAccountRowItem = BaseItem & {
    type: 'service_account';
    disabled?: boolean;
};

export type YdbDatabaseRowItem = Omit<BaseItem, 'inner'> & {
    type: 'ydb_database';
    disabled?: boolean;
};

export type SnowflakeOAuthIntegrationRowItem = Pick<BaseItem, 'displayConditions'> & {
    type: 'snowflake_oauth_integration';
};

export type OAuthSnowflakeRowItem = Pick<BaseItem, 'displayConditions'> &
    Pick<BaseControlItem, 'fakeValue'> & {
        type: 'oauth_snowflake';
        name?: string; // default 'refresh_token'
        buttonText?: string; // default 'Get token'
    };

export type PreparedRow =
    | OAuthTokenRowItem
    | OAuthTokenChytRowItem
    | CacheTtlRowItem
    | CountersRowItem
    | CollapseRowItem
    | AccuracyRowItem
    | MdbFormFillRowItem
    | MdbClusterRowItem
    | MdbFieldRowItem
    | CloudTreeSelectRowItem
    | ServiceAccountRowItem
    | YdbDatabaseRowItem
    | SnowflakeOAuthIntegrationRowItem
    | OAuthSnowflakeRowItem;

export type Row = CustomizableRow | PreparedRow;

export type ValidatedItemAction = 'include' | 'skip';

export type ValidatedItem = {
    name: string;
    defaultAction: ValidatedItemAction;
    type?: 'string' | 'boolean'; // default 'string'
    required?: boolean;
    nullable?: boolean;
    length?: number;
};

type FormApiSchemaItemCondition = {
    when: {
        name: string;
    };
    equals: ConnectionData[keyof ConnectionData];
    then: {
        selector: {
            name: string;
        };
        action: ValidatedItemAction;
    }[];
};

export type FormApiSchemaItem = {
    items: ValidatedItem[];
    conditions?: FormApiSchemaItemCondition[];
};

type FormApiSchema = {
    create?: FormApiSchemaItem;
    edit?: FormApiSchemaItem;
    check?: FormApiSchemaItem;
};

type FormUiSchema = {
    showCreateDatasetButton?: boolean;
    showCreateQlChartButton?: boolean;
};

export type FormSchema = {
    title: string;
    rows: Row[];
    apiSchema?: FormApiSchema;
    templateName?: string;
    uiSchema?: FormUiSchema;
};

export type GetConnectorSchemaResponse = {
    form: FormSchema;
};

export type GetConnectorSchemaArgs = {
    type: string;
    mode: 'create' | 'edit';
};
