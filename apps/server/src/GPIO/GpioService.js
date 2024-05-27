export class GpioService {
    #gpioDriver
    #loggerService

    constructor({gpioDriver, loggerService}) {
        if(!loggerService.log) {
            throw new Error('loggerService provided in PubSubServerService constructor has no log method')
        }

        this.#loggerService = loggerService
        this.#gpioDriver = gpioDriver

        this.#loggerService.log({
            level: 'info',
            message: 'ApplicationService.constructor executed successfully',
        })
    }

    test = () => {
        this.#loggerService.log({
            level: 'info',
            message: 'GpioService.test executed successfully',
        })
    }

    tearDownGpios = () => {
        this.#gpioDriver.tearDownGpios()

        this.#loggerService.log({
            level: 'info',
            message: 'GpioService.tearDownGpios executed successfully',
        })
    }

    addActiveLine = ({lineNumber = null, type = null, defaultValue = null, consumerServiceName = null}) => {
        if(lineNumber === null) {
            throw new Error("GpioService.addActiveLine error: no lineNumber provided")
        }
        if(type === null) {
            throw new Error("GpioService.addActiveLine error: no type provided")
        }
        if(consumerServiceName === null) {
            throw new Error("GpioService.addActiveLine error: no consumerServiceName provided")
        }

        this.#loggerService.log({
            level: 'info',
            message: 'GpioService.addActiveLine began',
        })

        this.#gpioDriver = this.#gpioDriver.addActiveLine({lineNumber, type, defaultValue, consumerServiceName})

        this.#loggerService.log({
            level: 'info',
            message: 'GpioService.addActiveLine executed successfully',
        })
        return this
    }

    getLineValue = (lineNumber) => {
        if(lineNumber === null) {
            throw new Error("GpioService.getLineValue error: no lineNumber provided")
        }
    
        return this.#gpioDriver.getLineValue(lineNumber)
    }

    setLineValue = ({lineNumber = null, value = null}) => {
        if(lineNumber === null ||  value === undefined) {
            throw new Error("GpioService.setLineValue error: no lineNumber provided")
        }
        if(value === null) {
            throw new Error("GpioService.setLineValue error: no value provided")
        }

        this.#gpioDriver = this.#gpioDriver.setLineValue({lineNumber, value})

        this.#loggerService.log({
            level: 'info',
            message: 'GpioService.setLineValue executed successfully',
        })

        return this
    }

    releaseLine = (lineNumber = null) => {
        this.#gpioDriver = this.#gpioDriver.releaseLine(lineNumber)

        this.#loggerService.log({
            level: 'info',
            message: 'GpioService.releaseLine executed successfully',
        })

        return this

    }

    getIsGpioOn = () => {
        return this.#gpioDriver.getIsGpioOn()
    }
}