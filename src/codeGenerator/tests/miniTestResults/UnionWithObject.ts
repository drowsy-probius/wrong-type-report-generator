import { UnionWithObject } from "../../../../tests/cases/mini/miniTest";

export const validateUnionWithObject = (value: unknown) => {
    const typedValue = value as UnionWithObject;
    const error = [];
    if (typedValue === null ||
        (typeof typedValue !== "object" &&
            typeof typedValue !== "function")) {
        error.push({
            propertyName: 'UnionWithObject',
            propertyChainTrace: [],
            expectedType: 'object',
            received: typedValue,
        });
    } else {
        if ((() => {
            const prevErrorLen = error.length;
            if (typedValue.t1 === null ||
                (typeof typedValue.t1 !== "object" &&
                    typeof typedValue.t1 !== "function")) {
                error.push({
                    propertyName: 'unionElement',
                    propertyChainTrace: ['t1'],
                    expectedType: 'object',
                    received: typedValue.t1,
                });
            } else {
                if (typeof typedValue.t1.t2 !== 'number') {
                    error.push({
                        propertyName: 't2',
                        propertyChainTrace: ['t1'],
                        expectedType: 'number',
                        received: typedValue.t1,
                    });
                }
            }
            return prevErrorLen !== error.length;
        })() &&
            (() => {
                const prevErrorLen = error.length;
                if (typedValue.t1 === null ||
                    (typeof typedValue.t1 !== "object" &&
                        typeof typedValue.t1 !== "function")) {
                    error.push({
                        propertyName: 'unionElement',
                        propertyChainTrace: ['t1'],
                        expectedType: 'object',
                        received: typedValue.t1,
                    });
                } else {
                    if (typeof typedValue.t1.t3 !== 'string') {
                        error.push({
                            propertyName: 't3',
                            propertyChainTrace: ['t1'],
                            expectedType: 'string',
                            received: typedValue.t1,
                        });
                    }
                }
                return prevErrorLen !== error.length;
            })()) {
            error.push({
                propertyName: 't1',
                propertyChainTrace: [],
                expectedType: ['object | object'],
                received: typedValue.t1,
            });
        }
    }
    return error.length === 0 ? undefined : error;
}