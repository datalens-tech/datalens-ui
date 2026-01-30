declare module 'ml-regression-polynomial' {
    export class PolynomialRegression {
        coefficients: number[];

        constructor(x: number[], y: number[], degree: number);

        predict(x: number): number;
        predict(x: number[]): number[];

        score(x: number[], y: number[]): number;

        toString(precision?: number): string;
        toLaTeX(precision?: number): string;
    }
}
