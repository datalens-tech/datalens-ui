import {v1 as uuid} from 'uuid';

class DatasetSDK {
    requiredPropertiesOnCreate = ['guid', 'title', 'calc_mode', 'type'];
    requiredPropertiesOnModify = ['guid'];
    requiredPropertiesOnDuplicate = ['guid'];
    requiredPropertiesOnRemove = ['guid'];

    validation({mode, field}) {
        const processedMode = mode.slice(0, 1).toUpperCase() + mode.slice(1);

        const missingRequireProperties = this[`requiredPropertiesOn${processedMode}`].reduce(
            (missingProperties, requiredProperty) => {
                if (!field[requiredProperty]) {
                    missingProperties.push(requiredProperty);
                }

                return missingProperties;
            },
            [],
        );

        if (missingRequireProperties.length) {
            throw new Error(`You should specify ${missingRequireProperties.join(', ')}`);
        }
    }

    modifyFieldSettings({field}) {
        const {title} = field;

        return {
            ...field,
            title: title.trim(),
        };
    }

    createField({field, fields}) {
        this.validation({mode: 'create', field, fields});

        const fieldPrepared = this.modifyFieldSettings({field});

        return [fieldPrepared, ...fields];
    }

    modifyField({field, fields}) {
        this.validation({mode: 'modify', field, fields});

        const {guid: modifiedFieldId} = field;

        return fields.map((fieldCurrent) => {
            const {guid: fieldId} = fieldCurrent;
            let fieldNext = fieldCurrent;

            if (fieldId === modifiedFieldId) {
                fieldNext = this.modifyFieldSettings({
                    field: {
                        ...fieldCurrent,
                        ...field,
                    },
                });
            }

            return fieldNext;
        });
    }

    duplicateField({field, fields}) {
        this.validation({mode: 'duplicate', field, fields});

        const {guid: duplicatedFieldId} = field;

        return fields.reduce(
            (duplicationField, fieldCurrent) => {
                const {guid: fieldId} = fieldCurrent;
                const {fieldsNext} = duplicationField;

                fieldsNext.push(fieldCurrent);

                if (fieldId === duplicatedFieldId) {
                    const fieldNext = {
                        ...fieldCurrent,
                        guid: uuid(),
                        title: this.getNextTitleField({field, fields}),
                    };

                    duplicationField.fieldNext = fieldNext;
                    fieldsNext.push(fieldNext);
                }

                return duplicationField;
            },
            {
                fieldNext: null,
                fieldsNext: [],
            },
        );
    }

    removeField({field, fields}) {
        this.validation({mode: 'remove', field, fields});

        const {guid: removedFieldId} = field;

        return fields.filter((fieldCurrent) => {
            const {guid: fieldId} = fieldCurrent;

            return fieldId !== removedFieldId;
        });
    }

    getNextTitleField({field, fields}) {
        const {title} = field;

        const getTitleInfo = (currentTitle) => {
            const regexNameByNumberDivider = /(.*)\s\((\d+)\)$/;
            const matchedTitle = currentTitle.match(regexNameByNumberDivider);
            let name, number;

            if (matchedTitle) {
                name = matchedTitle[1];
                number = Number(matchedTitle[2]);
            } else {
                name = currentTitle;
                number = 0;
            }

            return {
                name,
                number,
            };
        };

        const {name: currentName} = getTitleInfo(title);
        const allTitlesInfo = fields.map(({title}) => getTitleInfo(title));

        const nameWithoutSpaces = currentName.replace(/\s/g, '');

        const filteredTitlesInfo = allTitlesInfo.filter((titlesInfo) => {
            const {name} = titlesInfo;
            const currentNameWithoutSpaces = name.replace(/\s/g, '');

            return currentNameWithoutSpaces === nameWithoutSpaces;
        });

        const duplicationNumbers = filteredTitlesInfo.map(({number}) => number);
        let duplicationNumber = Math.max(...duplicationNumbers);

        return `${currentName} (${++duplicationNumber})`;
    }
}

export default new DatasetSDK();
