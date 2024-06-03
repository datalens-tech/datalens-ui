import React from 'react';

import type {CommonNumberFormattingOptions, Field} from 'shared';

import Number, {isFloatNumberFormatting, isIntegerNumberFormatting} from './Number/Number';

interface FormattingProps {
    dataType: Field['data_type'];
    formatting: CommonNumberFormattingOptions;
    onChange: (formatting: CommonNumberFormattingOptions) => void;
}

const Formatting: React.FC<FormattingProps> = (props) => {
    if (isIntegerNumberFormatting(props)) {
        return <Number {...props} />;
    }

    if (isFloatNumberFormatting(props)) {
        return <Number {...props} />;
    }

    return null;
};

export default Formatting;
