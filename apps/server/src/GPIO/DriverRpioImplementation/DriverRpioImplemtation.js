import { version, Chip, Line } from "node-libgpiod";
import rpio from 'rpio'

export const LINE_TYPE = {
    READ: "READ",
    WRITE: "WRITE"
}

export const LINE_NUMBERS = {
    SEVEN: 7,
    TWELVE: 12
}

export class DriverLibGpiodImplementation {
    #loggerService = null
    #chip = null
    #arrayActiveLines = []
    #isGpioOn = false
    
    constructor({loggerService, chipNumber = 0}) {
        this.#loggerService = loggerService
        this.#chip = new Chip(chipNumber);
        this.#isGpioOn = true;
    }

    getIsGpioOn = () => {
        return this.#isGpioOn
    }

    addActiveLine = ({lineNumber = null, type = null, defaultValue = null, consumerServiceName = null}) => {
        if(!LINE_TYPE[type]) {
            const errorMessage = "DriverLibGpiodImplementation.addActiveLine error: type should be READ or WRITE"
            this.#loggerService.log({ level: "info", message: errorMessage})
            throw new Error(errorMessage)
        }
        if(!LINE_NUMBERS[lineNumber]) {
            const errorMessage = `DriverLibGpiodImplementation.addActiveLine error: lineNumber should be one of ${LINE_NUMBERS}`
            this.#loggerService.log({ level: "info", message: errorMessage})
            throw new Error(errorMessage)
        }
        if(!this.#chip) {
            const errorMessage = "DriverLibGpiodImplementation.addActiveLine error: chip is not instanced."
            this.#loggerService.log({ level: "info", message: errorMessage})
            throw new Error(errorMessage)
        }

        const line =  new Line(this.#chip, lineNumber);

        if(type === LINE_TYPE.WRITE) {
            line.requestOutputMode(defaultValue, consumerServiceName)
        }
        if(type === LINE_TYPE.READ) {
            line.requestInputMode(consumerServiceName)
        }

        const activeLine = {line, lineNumber, type}
        this.#arrayActiveLines.push(activeLine)

        return this
    }

    getLineValue = (lineNumber = null) => {
        if(!lineNumber) {
            const errorMessage = "DriverLibGpiodImplementation.readLine error: no lineNumber provided."
            this.#loggerService.log({ level: "info", message: errorMessage})
            throw new Error(errorMessage)
        }

        const activeLine = this.#findActiveLine(lineNumber)

        if (activeLine.type !== LINE_TYPE.READ) {
            const errorMessage = "DriverLibGpiodImplementation.readLine error: requested line is not a READ TYPE."
            this.#loggerService.log({ level: "info", message: errorMessage})
            throw new Error(errorMessage)
        }

        const chipLine = activeLine.line

        return chipLine.getValue();
    }

    setLineValue = ({lineNumber = null, value = null}) => {
        if(!lineNumber) {
            const errorMessage = "DriverLibGpiodImplementation.readLine error: no lineNumber provided."
            this.#loggerService.log({ level: "info", message: errorMessage})
            throw new Error(errorMessage)
        }

        const activeLine = this.#findActiveLine(lineNumber)

        if (activeLine.type !== LINE_TYPE.WRITE) {
            const errorMessage = "DriverLibGpiodImplementation.readLine error: requested line is not a WRITE TYPE."
            this.#loggerService.log({ level: "info", message: errorMessage})
            throw new Error(errorMessage)
        }

        const chipLine = activeLine.line

        chipLine.setValue(value);

        return this
    }
    #findActiveLine = (lineNumber) => {
        const activeLine = this.#arrayActiveLines.find(candidateLine => candidateLine.lineNumber === lineNumber)

        if(!activeLine) {
            const errorMessage = "DriverLibGpiodImplementation.readLine error: requested line is not activated."
            this.#loggerService.log({ level: "info", message: errorMessage})
            throw new Error(errorMessage)
        }

        return activeLine
    }

    releaseLine = (lineNumber) => {
        if(!lineNumber) {
            const errorMessage = "DriverLibGpiodImplementation.readLine error: no lineNumber provided."
            this.#loggerService.log({ level: "info", message: errorMessage})
            throw new Error(errorMessage)
        }

        const activeLine = this.#findActiveLine(lineNumber)

        const chipLine = activeLine.line

        chipLine.release()

        this.#arrayActiveLines = this.#arrayActiveLines.filter(candidate => candidate.lineNumber !== lineNumber)

        return this
    }

    tearDownGpios = () => {
        if(this.#isGpioOn) {
            this.#arrayActiveLines.map(activeLine => {
                activeLine.line.release();
                this.#arrayActiveLines = this.#arrayActiveLines.filter(candidate => candidate.lineNumber !== activeLine.lineNumber)
            })

            this.#isGpioOn = false
        }

        return this
    }
}