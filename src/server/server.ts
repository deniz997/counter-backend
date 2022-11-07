import * as http from "http"
import Express from "express"
import { CounterApi } from "../api"
import { ErrorResponse, ResponseModel } from "../models/responseModel"
import { ErrorMessages } from "../models/errorMessages"

/**
 * LocalServer is the base class for servers.
 * Defines the basic structure of other servers and 
 * the functionalities they must have.
 * 
 * Author: Deniz Mert Tecimer
 */
export default abstract class LocalServer {

    //ExpressJS application
    protected _app: Express.Application
    //Http server
    protected _server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>
    //Port number to serve
    protected _port: number = 8999
    //Singleton instance of the counter api
    protected _counterApi: CounterApi
    //Is server on and listening
    protected _isListening = false
    //Servers that can be bound on another server
    protected _listeningServers: LocalServer[] = []
    //Singleton instance of the server
    protected static _instance: LocalServer

    protected constructor() {
        this._app = Express();
        this._server = http.createServer(this._app)
        this._counterApi = CounterApi.getInstance()
    }

    /**
     * Sets the port of the server and restarts
     * if the server is running.
     * @param port to be set on server
     * @returns the server instance
     */
    public setPort(port: number): LocalServer {
        this._port = port
        if(this._isListening) {
            this.restart()
        }
        return this
    }

    abstract start(): LocalServer

    protected abstract stop(): LocalServer

    private restart() {
        this.stop()
        this.start()
    }

    //Saves servers to be notified later on
    public bind(server: LocalServer): LocalServer {
        this._listeningServers.push(server)
        return this
    }

    protected abstract handleRequest(request: any): void

    protected abstract clientHello(sender?: any): void

    protected abstract sendResponse(response: ResponseModel, sender?: any, isHello?: boolean):void

    /**
     * Parses request message and convert to JSON
     * Validates JSON message
     * @param message 
     * @returns parsed JSON message
     */
    protected parseMessage(message: any) {
        let parsedData
        parsedData = JSON.parse(message)
        if(!this.validateMessage(parsedData)) {
            throw new Error(ErrorMessages.InvalidMessageFormatError)
        }
        return parsedData
    }

    /**
     * @param parsedMessage 
     * @returns true if inputs are in desired type, otherwise false
     */
    protected validateMessage(parsedMessage: any) {
        if(!parsedMessage.command && (typeof parsedMessage.command !== "string")) {
            console.log(ErrorMessages.CommandError)
            return false
        } else if(!parsedMessage.value && isNaN(parsedMessage.value)) {
            console.log(ErrorMessages.ValueError)
            return false
        }
        return true
    }

    /**
     * Creates error response based on given error
     * @param error to handle
     * @returns the error response with a specific message if the error is known,
     *          otherwise a generic error message
     */
    protected handleError(error: any): ErrorResponse {
        if(error instanceof Error) {
            console.log(error.message)
            return new ErrorResponse(error.message)
        } else {
            return new ErrorResponse(ErrorMessages.InternalServerError)
        }
    }

}