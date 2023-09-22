import isNumber from 'lodash/isNumber';

export function numberFormat(value: number | unknown) {
    return isNumber(value)
        ? new Intl.NumberFormat('ru-RU', {
              maximumFractionDigits: 20,
          }).format(value)
        : value;
}
