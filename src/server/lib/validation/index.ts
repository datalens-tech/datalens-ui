import type {Request} from '@gravity-ui/expresskit';
import Ajv from 'ajv';

import type {ValidationConfig, ValidationResult} from './types';

const ajv = new Ajv();

export function checkValidation(req: Request, validate: ValidationConfig): ValidationResult {
    let result: ValidationResult = {success: true};
    Object.keys(validate).every((propName: string): boolean => {
        if (validate[propName]) {
            const validator = ajv.compile(validate[propName]);

            if (!validator(req[propName as keyof Request])) {
                result = {
                    success: false,
                    message: ajv.errorsText(validator.errors),
                    details: validator.errors,
                };
                return false;
            }
        }

        return true;
    });
    return result;
}
