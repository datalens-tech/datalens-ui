import React from 'react';

import {cleanup, fireEvent, render} from '@testing-library/react';

import {ChartKitTableQa} from '../../../../../../../../../shared';
import Paginator from '../Paginator/Paginator';

afterEach(cleanup);

describe('chartkit/Table/Paginator', () => {
    let page = 1;

    const handleChange = (nextPage: number) => {
        page = typeof nextPage === 'number' ? nextPage : 0;
    };

    const setup = () => {
        const utils = render(<Paginator page={page} onChange={handleChange} />);
        const prevButton = utils.getByTestId(ChartKitTableQa.PaginatorPrevPageButton);
        const nextButton = utils.getByTestId(ChartKitTableQa.PaginatorNextPageButton);
        const input = utils.getByRole('spinbutton');

        return {
            prevButton,
            nextButton,
            input,
            ...utils,
        };
    };

    test('prev button should be disabled', () => {
        const {prevButton} = setup();
        const disabled = prevButton.hasAttribute('disabled');
        expect(disabled).toEqual(true);
    });

    test('start page should be equal 1', () => {
        const {input} = setup();
        expect(input.getAttribute('value')).toEqual('1');
    });

    test('page should be equal 2 after next button pressing', async () => {
        const {nextButton} = setup();
        // update fake page property
        fireEvent.click(nextButton);
        // remove old paginator from dom, otherwise getByTestId calls will crush
        cleanup();
        const {input} = setup();
        expect(input.getAttribute('value')).toEqual('2');
    });
});
