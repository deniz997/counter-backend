# Counter API
Author: Deniz Mert Tecimer

## Description
This is an example counter api which can be served by a websocket and a http server. It provides the current value in the counter and the history of the recent values. Based on the request, it updates the value and its history. This implementation is only to run **locally**.

## Requirements
You must have node (16.0.0) and npm (8.18.0) installed.

## Usage
Install dependencies by running the following command
```sh
npm install
```
### Configure
To configure the server, you can add environment variables via a **.env** file. **If server type is not given, both websoket and http servers are started with default ports.**

```
//Define server type
SERVER_TYPE=HTTP

//Define port number
SERVER_PORT=8080
```
To start the server with a new build run the following command
```sh
npm run dev
```

To start the built server
```sh
npm start
```

To build the TypeScript project
```sh
npm run build
```
### HTTP

#### Hello message
Example:
```
Request: 
    GET http://127.0.0.1:PORT/hello
Response:
    {
        message: {"Welcome message!\nINCREMENT"},
        state: {
            currentValue = 4,
            updatedHistory = [0,1,2,3,4]
        }
    }
```

#### Run command 
Example:
```
Request: 
    POST http://127.0.0.1:PORT/api
    body: {
            command: "INCREMENT",
            value: 1
          }
Response:
    {
        currentValue = 4,
        updatedHistory = [0,1,2,3,4]
    }
```

#### Error response
Example:
```
Error response:
    {
        error: "Internal server error!"
    }
```

### Websocket
When a client is connected, directly a hello response sequence (message response followed by a success response) is sent back to client. On an update on the value of the counter, all clients are notified about the updated state.

```
Message response:
    {
        message: {"Welcome message!\nINCREMENT"}
    }
```

Example current state message:
```
Success response:
    {
        currentValue = 4,
        updatedHistory = [0,1,2,3,4]
    }
```

#### Runing a command
To run a command on the api you must have a open connection to the server and send a message in the format showed in the example below.

Run command example:
```
{
    command: {"INCREMENT"},
    value: 1
}
```

#### Error response
Example:
```
{
    error: {"Welcome message!\nINCREMENT"}
}
```

## Extending the counter functionality

A new functionality can be added to the counter as the example shown below! You can find the example in index.ts file too, and try it out there or you can implement and try yours!

```ts
import Counter from "./counter"
const addedFunction = (currentValue: number, value: number) => currentValue * value
Counter.getInstance().addFunction("multiply", addedFunction)
```
 