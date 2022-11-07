/**
 * Counter applies actions on a value and preserves the current value
 * along with the last five updates made on the current value.
 * Counter has an extendible capability and new functionalities 
 * can be added dynamically.
 * 
 * Author: Deniz Mert Tecimer
 */

export default class Counter {
    
    //Current value
    private _value: number
    //History contains passed values
    private _history: Array<number>
    //Number of values to be stored in the history
    private _timeStepsToStore = 5
    //Singleton instance of the Counter
    private static _instance: Counter
    //An object containing commands of the Counter
    private _counterCommands: {[key: string]: string} = {}
    
    private constructor() {
        this._value = 0;
        this._history = new Array<number>()
        this._history.push(this._value);
        this._counterCommands.INCREMENT = "INCREMENT" 
    }

    /**
     * @returns Singleton instance of the Counter
     */
    public static getInstance() {
        if(!this._instance) {
            this._instance = new Counter();
        }
        return this._instance
    }

    /**
     * A mapping function that can be found dynamically 
     * as an object key and when triggered runs the private function with the same name.
     * @param value to increase the current value
     */
    public increment = function (value: number) {
        Counter._instance._increment(value)
    }

    /**
     * Increments the current value and updates the history
     * @param value to sum with the current value 
     */
    private _increment = (value: number) => {
        this._value = Number(value) + this._value
        this._updateHistory()
    }

    /**
     * Allows to extend the functionality of the Counter
     * Appends a new function property on the Counter 
     * When this function is triggered by command name, it will update the current value
     * based on the returned result of the function, then updatesthe history.
     * @example usage
     * const addedFunction = (currentValue:number, value:number) => currentValue * value
     * Counter.getInstance().addFunction("multiply", addedFunction)
     * @param command name to be added as the new function name
     * @param f function to be called when the command runs
     */
    public addFunction(command:string, f:Function) {
        (Counter._instance as any)[command.toLowerCase()] = function (value: number) {
            this._value = f(this._value, value)
            this._updateHistory()
        }
        const commandName = command.toUpperCase()
        this._counterCommands.commandName = commandName
    }

    /**
     * If the history array is full, shifts by removing the oldest record
     * and adds the current value to the history.
     */
    private _updateHistory = () => {
        if(this._history.length === this._timeStepsToStore) {
            this._history.shift();
        }
        this._history.push(this._value);
    }

    public get currentValue() {
        return this._value
    }

    public get history() {
        return this._history;
    }

    public get counterCommands() {
        return this._counterCommands
    }
}

