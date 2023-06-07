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
        if (typeof typedValue.t1 !== 'number' &&
            typeof typedValue.t1 !== 'string') {
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
