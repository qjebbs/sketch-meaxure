export enum BoolOperations {
    NONE,
    AND,
    OR,
    NOT
}

export type TestFunction = (layer: Layer) => boolean;
export type Condition = TestFunction | SelectCondition;

export function Test(func: TestFunction) {
    return new SelectCondition(BoolOperations.NONE, [func]);
}
export function And(...conditions: Condition[]) {
    return new SelectCondition(BoolOperations.AND, conditions);
}
export function Or(...conditions: Condition[]) {
    return new SelectCondition(BoolOperations.OR, conditions);
}
export function Not(condition: Condition) {
    return new SelectCondition(BoolOperations.NOT, [condition]);
}

export class SelectCondition {
    private _bool: BoolOperations;
    private _conditions: Condition[];
    constructor(
        bool: BoolOperations,
        conditions: Condition[]
    ) {
        this._bool = bool;
        this._conditions = conditions;
    }
    private _testCondition(layer: Layer, cond: Condition): boolean {
        if (cond instanceof SelectCondition) return cond.test(layer);
        return cond(layer);
    }
    test(layer: Layer): boolean {
        let result: boolean;
        switch (this._bool) {
            case BoolOperations.AND:
                for (let cond of this._conditions) {
                    result = this._testCondition(layer, cond);
                    if (!result) return false;
                }
                return true;
            case BoolOperations.OR:
                for (let cond of this._conditions) {
                    result = this._testCondition(layer, cond);
                    if (result) return true;
                }
                return false;
            case BoolOperations.NOT:
                return !this._testCondition(layer, this._conditions[0]);
            case BoolOperations.NONE:
                return this._testCondition(layer, this._conditions[0]);
            default:
                throw new Error('Unexpected bool operation: ' + this._bool);
        }
    }
}