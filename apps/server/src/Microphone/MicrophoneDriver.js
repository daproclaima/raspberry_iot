export class MicrophoneDriver {
    #gpioService = null
    #loggerService = null
    #microphoneImplementation = null

    constructor({loggerService, gpioService, microphoneImplementation}) {
        if(!gpioService.addActiveLine) {
            throw new Error('gpioService provided in MicrophoneService constructor has no addActiveLine method')
        }

        if(!loggerService.log) {
            throw new Error('loggerService provided in MicrophoneService constructor has no log method')
        }

        this.#gpioService = gpioService
        this.#loggerService = loggerService
        this.#microphoneImplementation = microphoneImplementation

        this.#loggerService.log({
            level: 'info',
            message: 'MicrophoneDriver.constructor executed successfully',
        })
    }

    listen = ({
      callbackOnstartComplete = () => {},
      callbackOnError = ({error}) => {},
      callbackOnPauseComplete = () => {},
      callbackOnStopComplete = () => {},
      callbackOnSilence = () => {},
      callbackOnProcessExitComplete = () => {},
      callbackOnResumeComplete = () => {},
      callbackOnData = ({data}) => {}
    }) => {
        this.#microphoneImplementation.listen({
            callbackOnstartComplete,
            callbackOnError,
            callbackOnPauseComplete,
            callbackOnStopComplete,
            callbackOnSilence,
            callbackOnProcessExitComplete,
            callbackOnResumeComplete,
            callbackOnData,
        })

        this.#loggerService.log({
            level: 'info',
            message: 'MicrophoneDriver.listen executed successfully',
        })
    }
}