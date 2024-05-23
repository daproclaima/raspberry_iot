import LedDriver from "./LedDriver.js";

import {
    PUBSUB_MESSAGE_GET_STATE_LED,
    PUBSUB_MESSAGE_SWITCH_OFF_LED,
    PUBSUB_MESSAGE_SWITCH_ON_LED,
    PUBSUB_MESSAGE_TERMINATE_GPIO_LED
} from "./MESSAGES.js";
import {
    PUBSUB_REPLY_FAILED_GET_STATE_LED,
    PUBSUB_REPLY_FAILED_SWITCH_OFF_LED,
    PUBSUB_REPLY_FAILED_SWITCH_ON_LED,
    PUBSUB_REPLY_FAILED_TERMINATE_GPIO_LED,
    PUBSUB_REPLY_STATE_LED_OFF,
    PUBSUB_REPLY_STATE_LED_ON,
    PUBSUB_REPLY_SWITCHED_OFF_LED,
    PUBSUB_REPLY_SWITCHED_ON_LED,
    PUBSUB_REPLY_TERMINATED_GPIO_LED,
    PUBSUB_REPLY_UNEXPECTED_MESSAGE
} from "./REPLIES.js";

export default class LedService {
    #loggerService = null
    #ledDriver = null
    #microphoneService = null
    #pubSubServerService = null
    #enumValidMessages = Object.freeze({
        PUBSUB_MESSAGE_SWITCH_ON_LED,
        PUBSUB_MESSAGE_SWITCH_OFF_LED,
        PUBSUB_MESSAGE_TERMINATE_GPIO_LED,
        PUBSUB_MESSAGE_GET_STATE_LED
    })
    #enumValidResponses = Object.freeze({
        PUBSUB_REPLY_SWITCHED_ON_LED,
        PUBSUB_REPLY_SWITCHED_OFF_LED,
        PUBSUB_REPLY_FAILED_SWITCH_ON_LED,
        PUBSUB_REPLY_FAILED_SWITCH_OFF_LED,
        PUBSUB_REPLY_UNEXPECTED_MESSAGE,
        PUBSUB_REPLY_TERMINATED_GPIO_LED,
        PUBSUB_REPLY_FAILED_TERMINATE_GPIO_LED,
        PUBSUB_REPLY_FAILED_GET_STATE_LED,
        PUBSUB_REPLY_STATE_LED_ON,
        PUBSUB_REPLY_STATE_LED_OFF,
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
            callbackOnConnection: this.#callbackOnConnectionPublishSubscribe,
            callbackOnMessage: this.#manipulateLed,
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
        this.#loggerService.log({level: 'info', topic: `ledDriver.#manipulateLed topic : ${data.topic}`})

        data = JSON.parse(data)
        const message = String(Buffer.from(data.message).toString())
        this.#loggerService.log({level: 'info', message: `ledDriver.#manipulateLed message : ${message}`})

        let reply = this.#enumValidResponses.PUBSUB_REPLY_UNEXPECTED_MESSAGE

        switch (message) {
            case this.#enumValidMessages.PUBSUB_MESSAGE_SWITCH_ON_LED:
                this.#ledDriver.switchOnLed()

                reply = this.#enumValidResponses.PUBSUB_REPLY_SWITCHED_ON_LED

                if(this.#ledDriver.getIsLedLit()) {
                    reply = this.#enumValidResponses.PUBSUB_REPLY_FAILED_SWITCH_ON_LED
                }
                break

            case this.#enumValidMessages.PUBSUB_MESSAGE_SWITCH_OFF_LED:
                this.#ledDriver.switchOffLed()

                reply = this.#enumValidResponses.PUBSUB_REPLY_SWITCHED_OFF_LED

                if(this.#ledDriver.getIsLedLit()) {
                    reply = this.#enumValidResponses.PUBSUB_REPLY_FAILED_SWITCH_OFF_LED
                }
                break

            case this.#enumValidMessages.PUBSUB_MESSAGE_TERMINATE_GPIO_LED:
                this.#ledDriver.tearDownGpios()

                reply = this.#enumValidResponses.PUBSUB_REPLY_TERMINATED_GPIO_LED

                if(this.#ledDriver.getIsGpioOn()) {
                    reply = this.#enumValidResponses.PUBSUB_REPLY_FAILED_TERMINATE_GPIO_LED
                }
                break;

            case this.#enumValidMessages.PUBSUB_MESSAGE_GET_STATE_LED:
                reply = this.#enumValidResponses.PUBSUB_REPLY_FAILED_GET_STATE_LED
                
                try {
                    if(this.#ledDriver.getIsGpioOn()) {
                        reply = this.#ledDriver.getIsLedLit() ? PUBSUB_REPLY_STATE_LED_ON : PUBSUB_REPLY_STATE_LED_OFF
                    }
                } catch (error) {
                    this.#loggerService.log({level: 'info', message: `ledDriver.#manipulateLed PUBSUB_MESSAGE_GET_STATE_LED: ${error}`})
                }
                break;

            default: {
                this.#loggerService.log({level: 'info', message: `LedService.manipulateLed data was not recognized : ${data}. Expected messages are of ${JSON.stringify(this.#enumValidMessages)}`})
            }
        }

        this.#pubSubServerService.reply({topic: 'LED_SERVICE/RESPONSE', message: reply})

        this.#loggerService.log({
            level: 'info',
            message: 'LedService.#manipulateLed executed successfully',
        })

        return this
    }

    #callbackOnConnectionPublishSubscribe = ({socket}) => {
        const {server: client} = socket
        client.subscribe(['LED_SERVICE/MESSAGE'])
        this.#loggerService.log({
            level: 'info',
            message: 'LedService.#callbackOnConnectionPublishSubscribe executed successfully',
        })
    }
}
