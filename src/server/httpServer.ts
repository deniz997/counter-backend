import { ErrorResponse, HttpClientHelloResponse, MessageResponse, ResponseModel, SuccessResponse } from "../models/responseModel";
import LocalServer from "./server";
import * as express from "express";
import cors from "cors";
import { ErrorMessages } from "../models/errorMessages";
import WebSockerServer from "./websocketServer";

/**
 * HTTPServer handles the incoming requests by delivering them
 * to the Counter Api. It can be used together with a websocket server
 * by binding and notifying it.
 * 
 * Author: Deniz Mert Tecimer
 */
export default class HttpServer extends LocalServer{

    //Instance of the started HTTPServer
    private _httpServer: any
    //Server type name
    static TYPE: string = "HTTP"
    
    private constructor(){
        super()
    }

    public static getInstance() {
        if(!this._instance){
            this._instance = new HttpServer()
        }
        return this._instance
    }

    /**
     * Starts the app after registering middlewares and routes
     * They provide the incoming request in the json format and handle cors
     * If app is on and listening updates the corresponding state.
     * @returns the server instance
     */
    public start() {
        this._app.use(express.json())
        this._app.use(cors())
        this.registerRouter()
        this._httpServer = this._app.listen(this._port, () => {
            console.log(`HTTPServer started on port ${this._port}!`);
                this._isListening = true;
        })
        return this
    }

    /**
     * Stops the app
     * Updates the corresponding state.
     * @returns the server instance
     */
    protected stop() {
        this._httpServer.close()
        this._isListening = false
        return this
    }

    /**
     * Retreives the greetings message from the counter api
     * and sends it to the client
     * @param res response to be modified and sent
     * @throws error if an error occurs while creating the HttpClientHelloResponse
     */
    protected clientHello(res: express.Response) {
        let messageResponse: MessageResponse | undefined
        let stateResponse: SuccessResponse | undefined
        this._counterApi.hello.map(message => {
            if(typeof message === 'string') {
                messageResponse = new MessageResponse(message)
            } else if(message instanceof SuccessResponse) {
                stateResponse = message
            }
        })
        if(messageResponse && stateResponse) {
            const helloResponse = new HttpClientHelloResponse(messageResponse, stateResponse)
            this.sendResponse(helloResponse, res)
        } else {
            throw new Error(ErrorMessages.HelloError)
        }
    }

    /**
     * Registers the routes on the app and
     * handles the request pipeline
     */
    private registerRouter(): any {
        this._app.get("/hello", (_, res) => {
            try{
                this.clientHello(res)
            } catch (error) {
                const errorResponse = this.handleError(error)
                this.sendResponse(errorResponse, res)
            }
        })
        
        this._app.post("/api", (req, res) => {
            try{
                const response = this.handleRequest(req.body)
                this.notifyListeners(response)
                this.sendResponse(response, res)
            } catch (error) {
                const errorResponse = this.handleError(error)
                this.sendResponse(errorResponse, res)
            }
        })
    }
    /**
     * Requests made to a specific endpoint may cause an update.
     * Notifies the websocket server bounded on http server. 
     */
    private notifyListeners (response: ResponseModel) {
        this._listeningServers.map(server => {
            if(server instanceof WebSockerServer) {
                server.notify(response)
            }
        })
    }

    /**
     * Delivers the request to counter api, if the request is valid.
     * @param request 
     * @returns the result from the counter api
     * @throws error if the request is not valid
     */
    protected handleRequest(request: any) {
        if(this.validateMessage(request)) {
            return this._counterApi.runCommand(request)
        } else {
            throw new Error(ErrorMessages.InvalidMessageFormatError)
        }
    }

    /**
     * Logs the response and sends it to the client based on the response type
     * @param response 
     * @param isHello ignored
     * @param res 
     * @returns 
     */
    protected override sendResponse(response: ResponseModel, res: express.Response): void {
        if(response instanceof ErrorResponse) {
            console.log(response.error)
            res.status(500).send(response)
            return
        }else if(response instanceof MessageResponse) {
            console.log("Message send to client!")
        }else if(response instanceof HttpClientHelloResponse) {
            console.log("Client hello was sent!")
        }else if(response instanceof SuccessResponse) {
            console.log("State was sent to client!")
        }
        res.status(200).send(response)
    }
   
}