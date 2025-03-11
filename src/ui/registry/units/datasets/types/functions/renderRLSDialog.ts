import type React from 'react';

import type {RLSDialogProps} from 'ui/units/datasets/components/RLSDialog/RLSDialog';

export type RenderRLSDialog<T1 = string, T2 = unknown> = (
    props: RLSDialogProps<T1, T2>,
) => React.ReactNode;
