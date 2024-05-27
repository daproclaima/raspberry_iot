import LedService from "../LED/LedService.js";

export class ApplicationService {
    #loggerService = null;
    #pubSubServerService = null;
    #gpioService = null;
    #ledService = null;
    #microphoneService = null;

    constructor({loggerService, pubSubServerService, gpioService, microphoneService, ledService}) {
        if(!pubSubServerService.listen) {
            throw new Error('pubSubServerImplementation provided in PubSubServerService constructor has no listen method')
        }

        if(!loggerService.log) {
            throw new Error('loggerService provided in PubSubServerService constructor has no log method')
        }

        if(!ledService.start) {
            throw new Error('ApplicationService.constructor error: provided ledService has no start method')
        }

        this.#loggerService = loggerService
        this.#pubSubServerService = pubSubServerService
        this.#gpioService = gpioService
        this.#microphoneService = microphoneService
        this.#ledService = ledService

        this.#loggerService.log({
            level: 'info',
            message: 'ApplicationService.constructor executed successfully',
        })
    }

    start = () => {
        try {
            this.#ledService.start()
        } catch(error) {
            this.#loggerService.log({
                level: 'error',
                message: `ApplicationService.start caught error: ${error}`
            })
        }

        return this
    }

    stop = () => {
        this.#gpioService.tearDownGpios()
        this.#microphoneService.stop()
        this.#pubSubServerService.closeConnection()
    }
}