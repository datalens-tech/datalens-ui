import React from 'react';

import {objectKeys} from 'shared';

import {DefaultEmpty} from '../components/DefaultEmpty';

type GetOptions = {
    //** should be used for cases when registry.components.get() calls outside of React component.*/
    wrap?: boolean;
};

export const createComponentsRegistry = function <ComponentsMap extends Record<string, any>>(
    components: ComponentsMap,
) {
    const map: {
        [key in keyof typeof components]?: React.ComponentType<unknown>;
    } = {};

    function withWrapperComponent<T extends keyof typeof components>(id: T) {
        const WrapperComponent = (props: any) => {
            const Component = map[id];
            if (!Component) {
                return null;
            }
            return <Component {...props} />;
        };
        return WrapperComponent as React.ComponentType<
            React.ComponentProps<(typeof components)[T]>
        >;
    }

    const registry = {
        register<T extends keyof typeof components>(
            id: T,
            component: React.ComponentType<any>,
        ): void {
            map[id] = component;
        },
        registerMany<Map extends Partial<typeof components>>(map: Map): void {
            Object.entries(map).forEach(([id, component]) => {
                this.register(id, component as React.ComponentType<any>);
            });
        },
        get<T extends keyof typeof components>(
            id: T,
            options?: GetOptions,
        ): React.ComponentType<React.ComponentProps<(typeof components)[T]>> {
            if (options?.wrap) {
                return withWrapperComponent(id);
            }

            const Component = map[id];
            if (!Component) {
                return DefaultEmpty;
            }

            return Component as React.ComponentType<React.ComponentProps<(typeof components)[T]>>;
        },
        getAll() {
            return map as ComponentsMap;
        },
    };

    objectKeys(components).forEach((id) => {
        registry.register(id, components[id]);
    });

    return registry;
};
