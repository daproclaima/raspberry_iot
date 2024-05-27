export default class LoggerService {
    #loggerImplementation = null

    constructor({loggerImplementation}) {
        if(!loggerImplementation.log) {
            throw new Error("object provided as loggerImplementation has no 'log' method.")
        }
        this.#loggerImplementation = loggerImplementation
    }

    get logger(){
        return this
    }

    log = (logObject) => {
        this.#loggerImplementation.log(logObject)
    }
}
