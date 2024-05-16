
export default class DriverGpioFakeImplementation {
    #loggerService = null
    #chip = null
    #arrayGpioDecorators = []
    #isGpioOn = false
    
    constructor({loggerService, chipNumber = 1}) {
        this.#loggerService = loggerService
        this.#chip = chipNumber
        this.#isGpioOn = false;

        this.#loggerService.log({
            level: 'info',
            message: 'DriverGpioFakeImplementation.constructor executed successfully',
        })
    }

    getIsGpioOn = () => {
        const isOn = this.#isGpioOn

        this.#loggerService.log({
            level: 'info',
            message: 'DriverGpioFakeImplementation.getIsGpioOn executed successfully',
        })

        return isOn
    }

    addActiveLine = ({lineNumber = null, type = null, defaultValue = 0, consumerServiceName = null, chip = 0}) => {
        this.#loggerService.log({
            level: 'info',
            message: `DriverGpioFakeImplementation.addActiveLine line executed successfully`,
        })

        return this
    }

    getLineValue = (lineNumber = null) => {
        this.#loggerService.log({
            level: 'info',
            message: 'DriverGpioFakeImplementation.getLineValue executed successfully',
        })

        return 0
    }

    getAsyncLineValue = async (lineNumber = null) => {
        this.#loggerService.log({
            level: 'info',
            message: 'DriverGpioFakeImplementation.getAsyncLineValue executed successfully',
        })

        return 0
    }

    setLineValue = ({lineNumber = null, value = null}) => {
        this.#loggerService.log({
            level: 'info',
            message: 'DriverGpioFakeImplementation.setLineValue executed successfully',
        })

        return this
    }

    setAsyncLineValue = async ({lineNumber = null, value = null}) => {
        this.#loggerService.log({
            level: 'info',
            message: 'DriverGpioFakeImplementation.setAsyncLineValue executed successfully',
        })

        return this
    }

    #findLine = (lineNumber) => {
        this.#loggerService.log({
            level: 'info',
            message: 'DriverGpioFakeImplementation.#findLine executed successfully',
        })

        return null
    }

    releaseLine = (lineNumber) => {
        this.#loggerService.log({
            level: 'info',
            message: 'DriverGpioFakeImplementation.releaseLine executed successfully',
        })

        return this
    }

    tearDownGpios = () => {
        this.#loggerService.log({
            level: 'info',
            message: 'DriverGpioFakeImplementation.tearDownGpios executed successfully',
        })

        return this
    }

}
