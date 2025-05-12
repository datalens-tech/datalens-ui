import React from 'react';

import {Link} from '@gravity-ui/uikit';
import {getEntryNameByKey} from 'shared/modules/entry';

import {getSdk} from '../../../../../../../../../../schematic-sdk';

interface Meta {
    key: string;
    scope: string;
    entryId: string;
}

type Props = {
    datasetId: string;
    setStatus: (status: 'success' | 'failed') => void;
    uiUrl?: string;
};

const Datalens: React.FC<Props> = ({datasetId, setStatus, uiUrl}) => {
    const [data, setData] = React.useState<Meta | null>(null);

    React.useEffect(() => {
        async function fetchData() {
            try {
                const data = await getSdk().sdk.us.getEntryMeta({entryId: datasetId});

                setData(data);
                setStatus('success');
            } catch (error) {
                console.error('DATALENS_SOURCE_FETCH_META_FAILED', error);
                setStatus('failed');
            }
        }
        fetchData();
    }, [datasetId, setStatus, uiUrl]);

    if (data) {
        const sourceName = getEntryNameByKey({key: data.key});
        const sourceLink =
            data.scope === 'dataset' ? `/datasets/${data.entryId}` : `/connections/${data.entryId}`;

        return (
            <Link target="_blank" href={uiUrl || sourceLink}>
                {sourceName}
            </Link>
        );
    }

    return null;
};

export default Datalens;
