import * as WebSocket from "ws"
import { ResponseModel, ErrorResponse, SuccessResponse, MessageResponse } from "../models/responseModel"
import LocalServer from "./server"

/**
 * WebSocketServer handles the incoming requests by delivering them
 * to the Counter Api and uses the websocket communication channel.
 * 
 * Author: Deniz Mert Tecimer
 */
export default class WebSockerServer extends LocalServer {

    wss: WebSocket.Server<WebSocket.WebSocket>
    static TYPE: string = "WS"

    private constructor() {
        super()
        const server = this._server
        this.wss = new WebSocket.Server({server})
    }

    public static getInstance() {
        if(!this._instance){
            this._instance = new WebSockerServer()
        }
        return this._instance
    }

    /**
     * Initiates and starts the websocket server.
     * If app is on and listening updates the corresponding state.
     * @returns the server instance
     */
    public start() {
        this.setupWebSocket()
        this._server.listen(this._port, () => {
            console.log(`WebSocketServer started on port ${this._port}!`);
            this._isListening = true;
        });
        return this
    }

    /**
     * Stops the websocket and the server.
     * Updates the corresponding state.
     * @returns the server instance
     */
    protected stop() {
        this.wss.close()
        this._server.close()
        this._isListening = false
        return this
    }

    /**
     * When a connection is established, sends the hello message
     * and registers listeners.
     */
    protected setupWebSocket() {
        this.wss.on('connection', (ws: WebSocket) => {
            this.clientHello(ws)
            this.registerMessageListener(ws)
        })
    }

    /**
     * Gets hello messages from the counter api and sends it to the client
     * @param ws websocket connection to reply
     */
    protected clientHello(ws: WebSocket) {
        this._counterApi.hello.map(message => {
            if(typeof message === 'string') {
                this.sendResponse(new MessageResponse(message), ws, true)
            } else if(message instanceof SuccessResponse) {
                this.sendResponse(message, ws, true)
            }
        })
    }

    /**
     * If a websocket is bound on a HTTPServer,
     * it can be notified on changes.
     * Sends received response to the clients
     * @param response to sent to client/s
     */
    public notify(response: ResponseModel) {
        this.sendResponse(response, null, false)
    }

    /**
     * Sends the message to all of connected the clients
     * @param msg to be sent
     * @returns the number of clients that the message was sent to
     */
    private broadcast(msg: string) {
        this.wss.clients.forEach(client => {
            client.send(msg)
        })
        return this.wss.clients.size
    }

    /**
     * Registers listener to handle the message received from a client
     * @param ws websocket connection of the client that sent the message
     */
    private registerMessageListener(ws: WebSocket) {
        ws.on('message', (data: string) => {
            let response: ResponseModel = new ResponseModel()
            try{
                response = this.handleRequest(data)
            } catch (error) {
                response = this.handleError(error)
            } finally {
                this.sendResponse(response, ws, false)
            }
        });
    }

    /**
     * Parses message and delivers it to the counter api
     * @param request to be parsed and handled
     * @returns the result received from the counter api
     */
    protected handleRequest(request: any) {
        const parsedData = this.parseMessage(request)
        return this._counterApi.runCommand(parsedData)
    }

    /**
     * Logs the response and sends it to the client/s based on the response type
     * @param response to be sent
     * @param ws websocket connection to reply back
     * @param isHello is the response for the newly connected client
     */
    protected sendResponse(response: ResponseModel, ws: WebSocket | null, isHello: boolean) {
        if(response instanceof ErrorResponse || response instanceof MessageResponse || isHello) {
            if(ws) {
                ws.send(JSON.stringify(response))
            } else {
                console.log("Can not find websocket!")
            }
            if(response instanceof ErrorResponse) {
                console.log(response.error)
            }else if(response instanceof MessageResponse) {
                console.log("Message send to client!")
            }else{
                console.log("Client hello was sent!")
            }
        } else if(response instanceof SuccessResponse) {
            const numOfClients = this.broadcast(JSON.stringify(response))
            console.log(numOfClients + " client/s have been notified!")
        }
    }
}