import React from 'react';

import type {RenderRowActionsProps, TableColumnConfig} from '@gravity-ui/uikit';
import {Button, Table, withTableActions} from '@gravity-ui/uikit';
import {I18n} from 'i18n';
import {FormSection} from 'ui/components/FormSection/FormSection';

import type {SimilarSelector} from '../../hooks/useSimilarSelectorsActions';
import {useSimilarSelectorsActions} from '../../hooks/useSimilarSelectorsActions';

const TableWithActions = withTableActions<SimilarSelector>(Table);

const i18n = I18n.keyset('dash.group-controls-dialog.edit');

const Content = ({
    selectors,
    isLoading,
    onSelectorJoin,
}: {
    selectors: SimilarSelector[];
    isLoading: boolean;
    onSelectorJoin: (selector: SimilarSelector) => void;
}) => {
    const columns = React.useMemo<TableColumnConfig<SimilarSelector>[]>(
        () => [
            {
                id: 'title',
                name: i18n('label_similiar-selectors-title'),
            },
            {
                id: 'tabTitle',
                name: i18n('label_similiar-selectors-tab'),
            },
        ],
        [],
    );

    const renderRowActions = React.useCallback(
        ({item}: RenderRowActionsProps<SimilarSelector>) => {
            const handleJoin = () => {
                if (item.joined) {
                    return;
                }
                onSelectorJoin(item);
            };
            return (
                <Button view="flat" onClick={handleJoin} selected={item.joined}>
                    {item.joined ? i18n('label_joined-selectors') : i18n('button_join-selectors')}
                </Button>
            );
        },
        [onSelectorJoin],
    );

    if (isLoading) {
        return null;
    }

    if (selectors.length === 0) {
        return <div>{i18n('label_find-no-similiar-selectors')}</div>;
    }

    return (
        <TableWithActions
            width="max"
            columns={columns}
            data={selectors}
            renderRowActions={renderRowActions}
        />
    );
};

export const SimilarSelectorsBlock = () => {
    const [isLoading, setIsLoading] = React.useState(true);
    const [selectors, setSelectors] = React.useState<SimilarSelector[]>([]);

    const {joinSelector, getSimilarSelectors} = useSimilarSelectorsActions();

    React.useEffect(() => {
        setSelectors(getSimilarSelectors());
        setIsLoading(false);
    }, [getSimilarSelectors]);

    const handleSelectorJoin = React.useCallback(
        (selector: SimilarSelector) => {
            joinSelector(selector);
            setSelectors(
                selectors.map((item) => (item.id === selector.id ? {...item, joined: true} : item)),
            );
        },
        [joinSelector, selectors],
    );

    const title =
        selectors.length > 0
            ? i18n('label_similiar-selectors')
            : i18n('label_finding-similiar-selectors-progress');

    return (
        <FormSection showLoader={isLoading} title={title}>
            <Content
                selectors={selectors}
                isLoading={isLoading}
                onSelectorJoin={handleSelectorJoin}
            />
        </FormSection>
    );
};
