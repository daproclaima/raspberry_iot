export default class MicrophoneService {
    #loggerService = null
    #gpioService = null
    #microphoneImplementation = null

    constructor({gpioService, loggerService, microphoneImplementation}) {
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
            message: 'MicrophoneService.constructor executed successfully',
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
            callbackOnData: ({data}) => {
                this.#loggerService.log({
                    level: 'info',
                    message: `MicrophoneService.listen -> callbackOnData data : ${data}`,
                })

                this.#loggerService.log({
                    level: 'info',
                    message: 'MicrophoneService.listen -> callbackOnData executed successfully',
                })

                callbackOnData({data})
            },
        })

        this.#loggerService.log({
            level: 'info',
            message: 'MicrophoneService.listen executed successfully',
        })

        return this
    }

    stop = () => {
        this.#microphoneImplementation.stop();
    }

    pause = () => {
        this.#microphoneImplementation.pause();
    }

    resume = () => {
        this.#microphoneImplementation.resume();
    }
}
