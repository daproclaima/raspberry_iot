import {LINE_NUMBERS} from "../GPIO/LINE_NUMBERS.js"
import {LINE_TYPES} from "../GPIO/LINE_TYPES.js"

const LED_GPIO_LINE_NUMBER = "SIXTEEN"

export default class LedDriver {
    #loggerService = null
    #gpioService = null

    constructor({loggerService, gpioService}) {
        if(!loggerService.log) {
            throw new Error('loggerService provided in PubSubServerService constructor has no log method')
        }

        this.#loggerService = loggerService
        this.#gpioService = gpioService

        this.#loggerService.log({
            level: 'info',
            message: 'LedDriver.constructor executed successfully',
        })

    }

    start = () => {
        if(!this.#gpioService.getIsGpioOn()) {
            throw new Error("LedDriver.start error: gpio is not accessible")
        }
        
        this.#addLedToChip({lineNumber: LED_GPIO_LINE_NUMBER, type: LINE_TYPES.WRITE, defaultValue: 0, consumerServiceName: 'LedDriver'})
        this.#loggerService.log({
            level: 'info',
            message: 'LedDriver.start executed successfully',
        })

        return this
    }

    #addLedToChip = ({lineNumber = LED_GPIO_LINE_NUMBER, type = LINE_TYPES.WRITE, defaultValue = 0, consumerServiceName = 'LedDriver'}) => {
        try {

            this.#gpioService.addActiveLine({lineNumber, type, defaultValue, consumerServiceName})
        } catch(error) {
            this.#loggerService.log({
                level: 'error',
                message: `LedDriver.#addLedToChip error: ${error}`,
            })

            throw new Error(error.message)
        }

        this.#loggerService.log({
            level: 'info',
            message: 'LedDriver.#addLedToChip executed successfully',
        })

        return this
    }

    tearDownGpios = () => {
        this.#gpioService.tearDownGpios()
        
        this.#loggerService.log({
            level: 'info',
            message: 'LedDriver.tearDownGpios executed successfully',
        })

        return this
    }

    getIsLedLit = () => {
        return this.#gpioService.getLineValue(LED_GPIO_LINE_NUMBER)
    }

    switchOnLed() {
        this.#gpioService.setLineValue({lineNumber: LED_GPIO_LINE_NUMBER, value: 1})
        this.#loggerService.log({
            level: 'info',
            message: 'LedDriver.switchOnLed executed successfully',
        })

        return this
    }
    
    switchOffLed() {
        this.#gpioService.setLineValue({lineNumber: LED_GPIO_LINE_NUMBER, value: 0})
        this.#loggerService.log({
            level: 'info',
            message: 'LedDriver.switchOffLed executed successfully',
        })

        return this
    }
}
