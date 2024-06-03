import React from 'react';

import type {StringParams} from 'shared';

import type {ChartKitProps} from '../../components/ChartKitBase/ChartKitBase';
import ChartKitBase from '../../components/ChartKitBase/ChartKitBase';
import type {DataProvider} from '../../types';

// TODO: make the dataProvider field mandatory in ChartKitBaseProps,
// TODO: but withDataProvider would return a type with an optional dataProvider field

type ChartKitPropsForwardedRef<TProviderProps, TProviderData, TProviderCancellation> =
    ChartKitProps<TProviderProps, TProviderData, TProviderCancellation> & {
        forwardedRef: React.Ref<ChartKitBase<TProviderProps, TProviderData, TProviderCancellation>>;
    };

function withDataProvider<
    TProviderProps extends {params?: StringParams | undefined},
    TProviderData,
    TProviderCancellation,
>(dataProvider: DataProvider<TProviderProps, TProviderData, TProviderCancellation>) {
    const ChartKitWithDataProvider: React.FC<
        ChartKitPropsForwardedRef<TProviderProps, TProviderData, TProviderCancellation>
    > = (props) => {
        const {forwardedRef, ...rest} = props;

        return (
            // @ts-ignore
            // TODO: ^ because ChartKitBaseProps has scalar types and defaultProps
            <ChartKitBase<TProviderProps, TProviderData, TProviderCancellation>
                // https://gist.github.com/OliverJAsh/d2f462b03b3e6c24f5588ca7915d010e
                {...(rest as ChartKitProps<TProviderProps, TProviderData, TProviderCancellation>)}
                dataProvider={dataProvider}
                ref={forwardedRef}
            />
        );
    };

    const ResultComponent = React.forwardRef<
        ChartKitBase<TProviderProps, TProviderData, TProviderCancellation>,
        ChartKitProps<TProviderProps, TProviderData, TProviderCancellation>
    >((props, ref) => <ChartKitWithDataProvider {...props} forwardedRef={ref} />);

    const ResultComponentWithStatic = ResultComponent as typeof ResultComponent & {
        registerPlugins: typeof ChartKitBase.registerPlugins;
        setGeneralSettings: typeof ChartKitBase.setGeneralSettings;
        setDataProviderSettings: typeof dataProvider.setSettings;
    };

    ResultComponentWithStatic.registerPlugins = ChartKitBase.registerPlugins;
    ResultComponentWithStatic.setGeneralSettings = ChartKitBase.setGeneralSettings;
    ResultComponentWithStatic.setDataProviderSettings = dataProvider.setSettings;

    return ResultComponentWithStatic;
}

export default withDataProvider;
