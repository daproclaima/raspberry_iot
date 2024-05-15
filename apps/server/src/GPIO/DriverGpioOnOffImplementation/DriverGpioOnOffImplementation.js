//  https://www.npmjs.com/package/onoff

import {Gpio} from "onoff";

import {LINE_NUMBERS} from "../LINE_NUMBERS.js"
import {LINE_TYPES} from "../LINE_TYPES.js"

export default class DriverGpioOnOffImplementation {
    #loggerService = null
    #chip = null
    #arrayGpioDecorators = []
    #isGpioOn = false
    
    constructor({loggerService, chipNumber = 1}) {
        this.#loggerService = loggerService
        this.#chip = chipNumber
        this.#isGpioOn = Gpio.accessible;

        this.#loggerService.log({
            level: 'info',
            message: 'DriverGpioOnOffImplementation.constructor executed successfully',
        })
    }

    getIsGpioOn = () => {
        const isOn = this.#isGpioOn

        this.#loggerService.log({
            level: 'info',
            message: 'DriverGpioOnOffImplementation.getIsGpioOn executed successfully',
        })

        return isOn
    }

    addActiveLine = ({lineNumber = null, type = null, defaultValue = 0, consumerServiceName = null, chip = 0}) => {
        if(!this.#isGpioOn) {
            const errorMessage = 'DriverGpioOnOffImplementation.addActiveLine error: Gpio is not accessible'
            this.#loggerService.log({ level: "info", message: errorMessage})
            throw new Error(errorMessage)
        }

        if(!LINE_TYPES[type]) {
            const errorMessage = "DriverGpioOnOffImplementation.addActiveLine error: type should be READ or WRITE"
            this.#loggerService.log({ level: "info", message: errorMessage})
            throw new Error(errorMessage)
        }
        if(!LINE_NUMBERS[lineNumber]) {
            const errorMessage = `DriverGpioOnOffImplementation.addActiveLine error: lineNumber should be one of ${JSON.stringify(LINE_NUMBERS)} while given ${lineNumber}`
            this.#loggerService.log({ level: "info", message: errorMessage})
            throw new Error(errorMessage)
        }

        const line = {gpio: null, lineNumber: LINE_NUMBERS[lineNumber], type, defaultValue, consumerServiceName}

        let gpio = null;

        if(type === LINE_TYPES.WRITE) {
            
            gpio = new Gpio(line.lineNumber, 'out');
            this.#loggerService.log({
                level: 'info',
                message: `DriverGpioOnOffImplementation.addActiveLine line: ${JSON.stringify(line)}. gpio: ${JSON.stringify(line.gpio)}`,
            })
            gpio.write(defaultValue)
        }

        if(type === LINE_TYPES.READ) {
            gpio = new Gpio(line.lineNumber, 'in');
        }

        if(!gpio) {
            throw new Error(`DriverGpioOnOffImplementation.addActiveLine error: could not create gpio ${JSON.stringify(line)}`)
        }

        line.gpio = gpio
        line.write = (value) => gpio.writeSync(value)
        line.writeAsync = (value) => gpio.write(value)
        line.unmount = () => gpio.unexport()
        line.read = () => gpio.readSync()
        line.readAsync = () => gpio.read()
        line.release = () => gpio.unexport()

        this.#arrayGpioDecorators.push(line)

        this.#loggerService.log({
            level: 'info',
            message: 'DriverGpioOnOffImplementation.addActiveLine executed successfully',
        })

        this.#loggerService.log({
            level: 'info',
            message: `DriverGpioOnOffImplementation.addActiveLine line: ${JSON.stringify(line)}. gpio: ${JSON.stringify(line.gpio)}`,
        })

        return this
    }

    getLineValue = (lineNumber = null) => {
        if(!lineNumber) {
            const errorMessage = "DriverGpioOnOffImplementation.getLineValue error: no lineNumber provided."
            this.#loggerService.log({ level: "info", message: errorMessage})
            throw new Error(errorMessage)
        }

        const line = this.#findLine(lineNumber)

        const value = line.read();

        this.#loggerService.log({
            level: 'info',
            message: 'DriverGpioOnOffImplementation.getLineValue executed successfully',
        })

        return value
    }

    getAsyncLineValue = async (lineNumber = null) => {
        if(!lineNumber) {
            const errorMessage = "DriverGpioOnOffImplementation.getAsyncLineValue error: no lineNumber provided."
            this.#loggerService.log({ level: "info", message: errorMessage})
            throw new Error(errorMessage)
        }

        const line = this.#findLine(lineNumber)

        if (line.type !== LINE_TYPES.READ) {
            const errorMessage = "DriverGpioOnOffImplementation.getAsyncLineValue error: requested line is not a READ TYPE."
            this.#loggerService.log({ level: "info", message: errorMessage})
            throw new Error(errorMessage)
        }

        const value = await line.readAsync();

        this.#loggerService.log({
            level: 'info',
            message: 'DriverGpioOnOffImplementation.getAsyncLineValue executed successfully',
        })

        return value
    }

    setLineValue = ({lineNumber = null, value = null}) => {
        if(lineNumber === null ||  value === undefined) {
            const errorMessage = "DriverGpioOnOffImplementation.setLineValue error: no lineNumber provided."
            this.#loggerService.log({ level: "info", message: errorMessage})
            throw new Error(errorMessage)
        }

        if(value === null || value === undefined) {
            const errorMessage = "DriverGpioOnOffImplementation.setLineValue error: no value provided."
            this.#loggerService.log({ level: "info", message: errorMessage})
            throw new Error(errorMessage)
        }
        
        const line = this.#findLine(lineNumber)

        if (line.type !== LINE_TYPES.WRITE) {
            const errorMessage = "DriverGpioOnOffImplementation.setLineValue error: requested line is not a WRITE TYPE."
            this.#loggerService.log({ level: "info", message: errorMessage})
            throw new Error(errorMessage)
        }

        this.#loggerService.log({ level: "info", message: `DriverGpioOnOffImplementation.setLineValue lineNumber: ${lineNumber}`})
        this.#loggerService.log({ level: "info", message: `DriverGpioOnOffImplementation.setLineValue value: ${value}`})

        line.write(value);

        this.#loggerService.log({
            level: 'info',
            message: 'DriverGpioOnOffImplementation.setLineValue executed successfully',
        })

        return this
    }

    setAsyncLineValue = async ({lineNumber = null, value = null}) => {
        if(!lineNumber) {
            const errorMessage = "DriverGpioOnOffImplementation.setAsyncLineValue error: no lineNumber provided."
            this.#loggerService.log({ level: "info", message: errorMessage})
            throw new Error(errorMessage)
        }

        if(!value) {
            const errorMessage = "DriverGpioOnOffImplementation.setAsyncLineValue error: no value provided."
            this.#loggerService.log({ level: "info", message: errorMessage})
            throw new Error(errorMessage)
        }
        
        if (line.type !== LINE_TYPES.WRITE) {
            const errorMessage = "DriverGpioOnOffImplementation.setAsyncLineValue error: requested line is not a WRITE TYPE."
            this.#loggerService.log({ level: "info", message: errorMessage})
            throw new Error(errorMessage)
        }
        
        const line = this.#findLine(lineNumber)

        if (line.type !== LINE_TYPES.WRITE) {
            const errorMessage = "DriverGpioOnOffImplementation.setAsyncLineValue error: requested line is not a WRITE TYPE."
            this.#loggerService.log({ level: "info", message: errorMessage})
            throw new Error(errorMessage)
        }

        await line.writeAsync(value);

        this.#loggerService.log({
            level: 'info',
            message: 'DriverGpioOnOffImplementation.setAsyncLineValue executed successfully',
        })

        return this
    }

    #findLine = (lineNumber) => {
        const line = this.#arrayGpioDecorators.find(candidateLine => candidateLine.lineNumber === LINE_NUMBERS?.[lineNumber])

        if(!line) {
            const errorMessage = "DriverGpioOnOffImplementation.#findLine error: requested line is not activated."
            this.#loggerService.log({ level: "error", message: errorMessage})
            throw new Error(errorMessage)
        }

        this.#loggerService.log({
            level: 'info',
            message: 'DriverGpioOnOffImplementation.#findLine executed successfully',
        })

        return line
    }

    releaseLine = (lineNumber) => {
        if(!lineNumber) {
            const errorMessage = "DriverGpioOnOffImplementation.releaseLine error: no lineNumber provided."
            this.#loggerService.log({ level: "error", message: errorMessage})
            throw new Error(errorMessage)
        }

        const line = this.#findLine(lineNumber)

        line.release()

        this.#arrayGpioDecorators = this.#arrayGpioDecorators.filter(candidate => candidate.lineNumber !== LINE_NUMBERS?.[lineNumber])

        this.#loggerService.log({
            level: 'info',
            message: 'DriverGpioOnOffImplementation.releaseLine executed successfully',
        })

        return this
    }

    tearDownGpios = () => {
        if(this.#isGpioOn) {
            this.#arrayGpioDecorators.map(line => {
                line.release();
                this.#arrayGpioDecorators = this.#arrayGpioDecorators.filter(candidate => candidate.lineNumber !== line.lineNumber)
            })

            this.#isGpioOn = false
        }

        this.#loggerService.log({
            level: 'info',
            message: 'DriverGpioOnOffImplementation.tearDownGpios executed successfully',
        })

        return this
    }

}
