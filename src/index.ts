/**
 * Starts server/s based on environment variables provided in .env file
 * 
 * If server type is not given, both websoket and http servers are started with
 * default ports.
 * 
 * A websocket connection needs be notified on a change made by the http server,
 * thus they must be bounded.
 * 
 * Author: Deniz Mert Tecimer
 */

 import WebSockerServer from "./server/websocketServer"
 import * as env from "dotenv"
 import HttpServer from "./server/httpServer"

/**
 * Get environment variables
 */

env.config()
const PORT = process.env.PORT
const SERVER_TYPE = process.env.SERVER_TYPE

/**
 * Starts servers based on configs
 */
if(SERVER_TYPE === HttpServer.TYPE && PORT){
    HttpServer.getInstance().setPort(+PORT).start()
} else if(SERVER_TYPE === WebSockerServer.TYPE && PORT){
    WebSockerServer.getInstance().setPort(+PORT).start()
} else {
    const wsServer = WebSockerServer.getInstance().setPort(8999).start()
    HttpServer.getInstance().setPort(8080).bind(wsServer).start()
}
