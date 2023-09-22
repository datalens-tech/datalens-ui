import Ajv from 'ajv';

const ajv = new Ajv();

export function validate(data: unknown, schema: object) {
    const validateFn = ajv.compile(schema);

    return validateFn(data) ? false : ajv.errorsText(validateFn.errors);
}
