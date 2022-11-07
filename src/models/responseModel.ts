import { ErrorMessages } from "./errorMessages"
/**
 * Contains the types/classes for the responses
 * 
 * Author: Deniz Mert Tecimer
 */
export class ResponseModel {}
export class SuccessResponse extends ResponseModel {
    currentValue: number
    updatedHistory: Array<number>

    constructor(currentValue: number, updatedHistory: Array<number>){
        super()
        this.currentValue = currentValue
        this.updatedHistory = updatedHistory
    }
}

export class ErrorResponse extends ResponseModel {
    error: ErrorMessages | string

    constructor(error: ErrorMessages | string) {
        super()
        this.error =  error
    }
}

export class MessageResponse extends ResponseModel {
    message: string

    constructor(message: string) {
        super()
        this.message = message
    }
}

export class HttpClientHelloResponse extends ResponseModel {
    message: MessageResponse
    state: SuccessResponse

    constructor(message: MessageResponse, state: SuccessResponse) {
        super()
        this.message = message
        this.state = state
    }
}
