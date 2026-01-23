import React from 'react';

import {FormRow} from '@gravity-ui/components';
import {Checkbox, Flex, Switch, spacing} from '@gravity-ui/uikit';
import {I18n} from 'i18n';

const i18n = I18n.keyset('dash.dashkit-plugin-common.view');
const INPUT_INTERNAL_MARGINS_ID = 'widgetInternalMarginsField';
const LIKE_DASH_INTERNAL_MARGINS_ID = 'likeDashInternalMarginsField';

interface InternalMarginsTogglerProps {
    value?: boolean;
    onUpdate: (value: boolean | undefined) => void;
    className?: string;
    initialDisabledValue: boolean;
}

export function InternalMarginsToggler({
    value,
    onUpdate,
    className,
    initialDisabledValue,
}: InternalMarginsTogglerProps) {
    const [likeDashInternalMargins, setLikeDashInternalMargins] = React.useState(
        value === undefined,
    );
    const handleLikeDashInternalMarginsUpdate = React.useCallback(
        (v: boolean) => {
            setLikeDashInternalMargins(v);
            onUpdate(v ? undefined : initialDisabledValue);
        },
        [initialDisabledValue, onUpdate],
    );
    return (
        <FormRow
            className={className}
            label={i18n('label_internal-margins')}
            fieldId={INPUT_INTERNAL_MARGINS_ID}
        >
            <Flex alignItems="baseline" className={spacing({mt: 0.5})} gap={2}>
                <Switch
                    id={INPUT_INTERNAL_MARGINS_ID}
                    size="m"
                    disabled={likeDashInternalMargins}
                    onUpdate={onUpdate}
                    checked={likeDashInternalMargins ? initialDisabledValue : value}
                />
                <Checkbox
                    title={i18n('label_like-dash')}
                    id={LIKE_DASH_INTERNAL_MARGINS_ID}
                    size="m"
                    onUpdate={handleLikeDashInternalMarginsUpdate}
                    checked={likeDashInternalMargins}
                >
                    {i18n('label_like-dash')}
                </Checkbox>
            </Flex>
        </FormRow>
    );
}
