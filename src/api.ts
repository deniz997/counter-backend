import Counter from "./counter"
import { ErrorMessages } from "./models/errorMessages";
import { Messages } from "./models/messages";
import { RequestModel } from "./models/requestModel";
import { ResponseModel, SuccessResponse } from "./models/responseModel";

/**
 * CounterApi is the application interface to interact with the counter.
 * Triggers functions of the counter and delivers the result to the server. 
 * 
 * Author: Deniz Mert Tecimer
 */
export class CounterApi{

    //Singleton instance of the CounterApi
    private static _instance: CounterApi

    //Singleton instance of the Counter
    private _counter: Counter

    private constructor(){
        this._counter = Counter.getInstance()
    }

    /**
     * @returns Singleton instance of the CounterApi
     */
    public static getInstance() {
        if(!this._instance){
            this._instance = new CounterApi()
        }
        return this._instance
    }

    /**
     * Checks whether the command received in request exists
     * Runs the command with the given value on the counter
     * @param request contains the command and the value
     * @returns response as the updated state of the counter
     */
    public runCommand(request: RequestModel): ResponseModel {
        const commandExists = Object.values(this._counter.counterCommands).includes(request.command.toUpperCase())
        const command = commandExists ? request.command.toLowerCase() : null
        if(!command) {
            throw new Error(ErrorMessages.CommandNotFound)
        }
        (this._counter as any)[command](request.value)
        return this._getResponse()
    }

    /**
     * @returns the current value and the history as a success response
     */
    private _getResponse(): SuccessResponse {
        const counter = Counter.getInstance()
        const currentValue = counter.currentValue
        const updatedHistory = counter.history
        return new SuccessResponse(currentValue, updatedHistory)
    }

    /**
     * @returns commands list as a string
     */
    private _commandList(){
        let commandListString = ""
        Object.values(this._counter.counterCommands).map(command => {
            commandListString = commandListString + this._counter.counterCommands[command]
        })
        return commandListString;
    }

    private get _welcomeMessage(){
        return Messages.WelcomeMessage + "\n" + this._commandList(); 
    }

    private getWelcomeResponse() {
        return this._welcomeMessage
    }

    /**
     * Retrieves welcome message and the current state.
     * Probably for a websocket connection as consequent responses can be sent.
     * @returns an array of responses to send back to client
     */
    get hello() {
        return [this.getWelcomeResponse(), this._getResponse()]
    }
}

