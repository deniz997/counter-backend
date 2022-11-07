/**
 * Contains the type/classe for the request
 * 
 * Author: Deniz Mert Tecimer
 */

export class RequestModel {
    command: string
    value: number

    constructor(command: string, value: number) {
        this.command = command
        this.value = value
    }
}