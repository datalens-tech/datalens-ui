import type {z} from 'zod';

const registeredComponents: string[] = [];

export const registerOpenApiComponent = <T extends z.ZodType>(id: string, schema: T): T => {
    if (registeredComponents.includes(id)) {
        throw new Error(`OpenAPI component ${id} is already registered`);
    }

    registeredComponents.push(id);
    return schema.openapi(id, {title: id});
};
