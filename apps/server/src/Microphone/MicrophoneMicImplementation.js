import mic from "mic";
import fs from 'fs';

// https://www.npmjs.com/package/mic
export class MicrophoneMicImplementation {
    #loggerService = null
    #configuration = {
        rate: '16000',
        channels: '1',
        debug: true,
        exitOnSilence: 6
    }
    #server = null
    #inputStream = null
    #outputFileStream = fs.WriteStream('output.raw');


    constructor({loggerService}) {
        if(!loggerService.log) {
            throw new Error('loggerService provided in MicrophoneMicImplementation constructor has no log method')
        }

        this.#loggerService = loggerService
        this.#server = mic(this.#configuration)


        this.#loggerService.log({
            level: 'info',
            message: 'MicrophoneMicImplementation.constructor executed successfully',
        })
    }

    listen = ({
        callbackOnstartComplete = () => {},
        callbackOnError = ({error}) => error,
        callbackOnPauseComplete = () => {},
        callbackOnStopComplete = () => {},
        callbackOnSilence = () => {},
        callbackOnProcessExitComplete = () => {},
        callbackOnResumeComplete = () => {},
        callbackOnData = ({data}) => data
    }) => {
        let inputStream = this.#server.getAudioStream();

        this.#inputStream = inputStream.pipe(this.#outputFileStream);

        this.#inputStream.on('startComplete', () => {
            this.#loggerService.log({
                level: 'error',
                message: 'MicrophoneMicImplementation.listen startComplete. Got SIGNAL startComplete',
            })

            callbackOnstartComplete()

            setTimeout(() => {
                this.#server.pause();
            }, 5000);

            this.#loggerService.log({
                level: 'info',
                message: 'MicrophoneMicImplementation.listen startComplete -> callbackOnstartComplete() executed successfully',
            })
        });
        this.#inputStream.on('error', (error) => {
            this.#loggerService.log({
                level: 'error',
                message: `MicrophoneMicImplementation.listen error: ${error}`,
            })

            callbackOnError({error})

            this.#loggerService.log({
                level: 'info',
                message: 'MicrophoneMicImplementation.listen pauseComplete -> callbackOnError({error}) executed successfully',
            })
        });
        this.#inputStream.on('pauseComplete', () => {
            this.#loggerService.log({
                level: 'info',
                message: 'MicrophoneMicImplementation.listen silence. Got SIGNAL pauseComplete',
            })

            callbackOnPauseComplete()

            setTimeout(() => {
                this.#server.resume();
            }, 5000);

            this.#loggerService.log({
                level: 'info',
                message: 'MicrophoneMicImplementation.listen pauseComplete -> callbackOnPauseComplete() executed successfully',
            })
        });
        this.#inputStream.on('stopComplete', () => {
            this.#loggerService.log({
                level: 'info',
                message: 'MicrophoneMicImplementation.listen silence. Got SIGNAL stopComplete',
            })

            callbackOnStopComplete()

            this.#loggerService.log({
                level: 'info',
                message: 'MicrophoneMicImplementation.listen stopComplete -> callbackOnStopComplete() executed successfully',
            })
        });
        this.#inputStream.on('silence', () => {
            this.#loggerService.log({
                level: 'info',
                message: 'MicrophoneMicImplementation.listen silence. Got SIGNAL silence',
            })

            callbackOnSilence()

            this.#loggerService.log({
                level: 'info',
                message: 'MicrophoneMicImplementation.listen silence -> callbackOnSilence() executed successfully',
            })
        });
        this.#inputStream.on('resumeComplete', () => {
            console.log("Got SIGNAL resumeComplete");
            this.#loggerService.log({
                level: 'info',
                message: 'MicrophoneMicImplementation.listen resumeComplete. Got SIGNAL resumeComplete',
            })

            callbackOnResumeComplete()

            setTimeout(() => {
                this.#server.stop();
            }, 5000);

            this.#loggerService.log({
                level: 'info',
                message: 'MicrophoneMicImplementation.listen resumeComplete -> callbackOnResumeComplete() executed successfully',
            })
        });
        this.#inputStream.on('processExitComplete', () => {
            this.#loggerService.log({
                level: 'info',
                message: 'MicrophoneMicImplementation.listen processExitComplete. Got SIGNAL processExitComplete',
            })

            callbackOnProcessExitComplete()

            this.#loggerService.log({
                level: 'info',
                message: 'MicrophoneMicImplementation.listen processExitComplete -> callbackOnProcessExitComplete executed successfully',
            })

        });
        this.#inputStream.on('data', (data) => {
            this.#loggerService.log({
                level: 'info',
                message: `MicrophoneMicImplementation.listen data received input stream data.length ${data.length}`,
            })

            callbackOnData({data})

            this.#loggerService.log({
                level: 'info',
                message: 'MicrophoneMicImplementation.listen data -> callbackOnData({data}) executed successfully',
            })
        });

        this.#server.start();

        this.#loggerService.log({
            level: 'info',
            message: 'MicrophoneMicImplementation.listen executed successfully',
        })
    }

    stop = () => {
        this.#server.stop();
    }

    pause = () => {
        this.#server.pause();
    }

    resume = () => {
        this.#server.resume();
    }
}