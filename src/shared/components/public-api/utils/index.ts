const registeredComponents = new Set<string>();

export const registerComponentId = (id: string): string => {
    if (registeredComponents.has(id)) {
        throw new Error(`OpenAPI component ${id} is already registered`);
    }

    registeredComponents.add(id);

    return id;
};
