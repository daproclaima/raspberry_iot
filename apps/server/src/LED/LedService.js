import LedDriver from "./LedDriver.js";

import {WSS_MESSAGE_SWITCH_OFF_LED, WSS_MESSAGE_SWITCH_ON_LED, WSS_MESSAGE_TERMINATE_GPIO_LED} from "./MESSAGES.js";
import {
    WSS_REPLY_FAILED_SWITCH_OFF_LED,
    WSS_REPLY_FAILED_SWITCH_ON_LED, WSS_REPLY_FAILED_TERMINATE_GPIO_LED,
    WSS_REPLY_SWITCHED_OFF_LED,
    WSS_REPLY_SWITCHED_ON_LED, WSS_REPLY_TERMINATED_GPIO_LED, WSS_REPLY_UNEXPECTED_MESSAGE
} from "./REPLIES.js";

export default class LedService {
    #loggerService = null
    #ledDriver = null
    #microphoneService = null
    #pubSubServerService = null
    #enumValidMessages = Object.freeze({
        WSS_MESSAGE_SWITCH_ON_LED,
        WSS_MESSAGE_SWITCH_OFF_LED,
        WSS_MESSAGE_TERMINATE_GPIO_LED,
    })
    #enumValidResponses = Object.freeze({
        WSS_REPLY_SWITCHED_ON_LED,
        WSS_REPLY_SWITCHED_OFF_LED,
        WSS_REPLY_FAILED_SWITCH_ON_LED,
        WSS_REPLY_FAILED_SWITCH_OFF_LED,
        WSS_REPLY_UNEXPECTED_MESSAGE,
        WSS_REPLY_TERMINATED_GPIO_LED,
        WSS_REPLY_FAILED_TERMINATE_GPIO_LED,
    })

    constructor({loggerService, gpioService, pubSubServerService, microphoneService}) {
        if(!loggerService.log) {
            throw new Error('loggerService provided in PubSubServerService constructor has no log method')
        }

        this.#loggerService = loggerService
        this.#pubSubServerService = pubSubServerService
        this.#microphoneService = microphoneService

        this.#ledDriver = new LedDriver({loggerService, gpioService})

        this.#loggerService.log({
            level: 'info',
            message: 'LedService.constructor executed successfully',
        })
    }

    test = () => {
        this.#loggerService.log({
            level: 'info',
            message: 'LedService.test executed successfully',
        })
    }

    start = () => {
        if(!this.#pubSubServerService) {
            throw new Error('LedService.start: no pubSubServerService provided')
        }

        if(!this.#pubSubServerService.listen) {
            throw new Error('LedService.start: this.#pubSubServerService has no listen method')
        }

        if(!this.#pubSubServerService.listen) {
            throw new Error('LedService.start: this.#pubSubServerService has no listen method')
        }

        // on mac causes: Warning: epoll is built for Linux and not intended for usage on Darwin. error: ApplicationService.start caught error: Error: ENOENT: no such file or directory, open '/sys/class/gpio/export'
        this.#ledDriver.start()

        this.#pubSubServerService.listen({
            callbackOnMessage: this.#manipulateLed,
            // callbackOnConnection: () => {},
            // callbackOnError: () => {},
            // callbackOnOpen :() => {},
            // callbackOnClose: () => {}
        })
        
        // this.#microphoneService.listen({
        //     callbackOnData: this.#manipulateLed
        //     // callbackOnstartComplete: () => {},
        //     // callbackOnError: ({error}) => {},
        //     // callbackOnPauseComplete: () => {},
        //     // callbackOnStopComplete: () => {},
        //     // callbackOnSilence: () => {},
        //     // callbackOnProcessExitComplete: () => {},
        //     // callbackOnResumeComplete: () => {},
        // })

        this.#loggerService.log({
            level: 'info',
            message: 'LedService.start executed successfully',
        })
    }

    #manipulateLed = ({data}) => {
        this.#loggerService.log({level: 'info', message: `ledDriver.#manipulateLed data : ${data}`})

        data = JSON.parse(data)
        const message = String(Buffer.from(data.message).toString())
        this.#loggerService.log({level: 'info', message: `ledDriver.#manipulateLed message : ${message}`})
        
        let responsePayload = this.#enumValidResponses.WSS_REPLY_UNEXPECTED_MESSAGE

        switch (message) {
            case this.#enumValidMessages.WSS_MESSAGE_SWITCH_ON_LED:
                this.#ledDriver.switchOnLed()

                responsePayload = this.#enumValidResponses.WSS_REPLY_SWITCHED_ON_LED

                if(this.#ledDriver.getIsLedLit()) {
                    responsePayload = this.#enumValidResponses.WSS_REPLY_FAILED_SWITCH_ON_LED
                }
                break

            case this.#enumValidMessages.WSS_MESSAGE_SWITCH_OFF_LED:
                this.#ledDriver.switchOffLed()

                responsePayload = this.#enumValidResponses.WSS_REPLY_SWITCHED_OFF_LED

                if(this.#ledDriver.getIsLedLit()) {
                    responsePayload = this.#enumValidResponses.WSS_REPLY_FAILED_SWITCH_OFF_LED
                }
                break

            case this.#enumValidMessages.WSS_MESSAGE_TERMINATE_GPIO_LED:
                this.#ledDriver.tearDownGpios()

                responsePayload = this.#enumValidResponses.WSS_REPLY_TERMINATED_GPIO_LED

                if(this.#ledDriver.getIsGpioOn()) {
                    responsePayload = this.#enumValidResponses.WSS_REPLY_FAILED_TERMINATE_GPIO_LED
                }
                break;

            default: {
                this.#loggerService.log({level: 'info', message: `LedService.manipulateLed data was not recognized : ${data}. Expected messages are of ${JSON.stringify(this.#enumValidMessages)}`})
            }

        }

        this.#pubSubServerService.reply({topic: 'LED/CONTROL', message: responsePayload})

        this.#loggerService.log({
            level: 'info',
            message: 'LedService.#manipulateLed executed successfully',
        })

        return this
    }
}
