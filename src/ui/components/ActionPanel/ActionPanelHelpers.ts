export default class ActionPanelHelpers {
    static getNameByKey({key = ''}) {
        const matchedValues = key.match(/\/([^/]*)$/);

        return matchedValues ? matchedValues[1] : key;
    }
}
