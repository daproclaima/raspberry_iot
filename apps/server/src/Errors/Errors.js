export default class Errors {
    static WebSocketServer = {
        EMPTY_INFORMANT_REPLY: {
            code: 'EMPTY_INFORMANT_REPLY',
            message: 'A reply can not be undefined or null. At least Informant defaultReply should be sent when no acceptable message is processed by informant'
        }
    }
}
