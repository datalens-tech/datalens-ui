import type {Field, ServerField} from 'shared';
import {PseudoFieldTitle, createMeasureNames, createMeasureValues} from 'shared';

import {mapServerFieldToWizardField} from '../../mappers/mapChartsToClientConfig';

describe('mappers', () => {
    describe('mapServerFieldToWizardField function', () => {
        it('Must enrich server fields with a source field ', () => {
            const serverFields = [{guid: 'fakeGuid'}] as ServerField[];
            const fieldsDict = {
                fakeGuid: {
                    someProp1: true,
                    someProp2: false,
                    someProp3: 'someProp3Value',
                },
            } as unknown as Record<string, Field>;

            const result = mapServerFieldToWizardField(serverFields, fieldsDict);

            expect(result).toEqual([
                {
                    ...serverFields[0],
                    ...fieldsDict.fakeGuid,
                },
            ]);
        });

        it('Must correctly enrich the Measure Names field ', () => {
            const serverFields = [{title: PseudoFieldTitle.MeasureNames}] as ServerField[];
            const fieldsDict = {};
            const result = mapServerFieldToWizardField(serverFields, fieldsDict);
            expect(result).toEqual([createMeasureNames()]);
        });

        it('Must correctly enrich the Measure Values field ', () => {
            const serverFields = [{title: PseudoFieldTitle.MeasureValues}] as ServerField[];
            const fieldsDict = {};
            const result = mapServerFieldToWizardField(serverFields, fieldsDict);
            expect(result).toEqual([createMeasureValues()]);
        });

        it('Should mark the field as invalid if the source field was not found', () => {
            const serverFields = [{}] as ServerField[];
            const fieldsDict = {};
            const result = mapServerFieldToWizardField(serverFields, fieldsDict);
            expect(result).toEqual([{valid: false}]);
        });
    });
});
