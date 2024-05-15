//  https://www.npmjs.com/package/onoff

import gpio from 'rpi-gpio'

//  not supported on raspberry pi 5
export default class DriverGpioRpiGpioImplementation {
    #driver = null
    #loggerService = null
    isGpioToTearUp = false
    #isExceptionOccured = false

    constructor({loggerService}) {
        this.#loggerService = loggerService
        this.#driver = gpio
    }

    tearDownGpios(gpioSessionFromGpioExecuteMethod) {
        this.isGpioToTearUp = true

        const callback = gpioSession => {
            gpioSession = gpioSessionFromGpioExecuteMethod ?? gpioSession

            gpioSession.destroy((error) => {
                if (error) {
                    this.logger.log({
                        level: 'error',
                        message: `LedDriverGpioRpiGpioImplementation.tearUpGpios error : ${error}`
                    })
                } else {
                    this.logger.log({
                        level: 'info',
                        message: 'LedDriverGpioRpiGpioImplementation.tearUpGpios executed'
                    })
                }
            });
        }

        this.#gpioExecute(callback)
    }

    #gpioExecute = callback => {
        const logger = this.logger
        try {
            const gpioSession = this.#driver

            gpioSession.setup(this.PIN_12, gpioSession.DIR_OUT, () => {
                this.logger.log({
                    level: 'info',
                    message: `LedDriverGpioRpiGpioImplementation.construct set up pin ${this.PIN_12}`
                })

                callback(gpioSession)

                if (this.isGpioToTearUp) this.tearUpGpios(gpioSession)
            });
        } catch (error) {
            logger.log({
                level: 'error',
                message: `LedDriverGpioRpiGpioImplementation.#gpioExecute error : ${error}`
            })
        }
    }

    #listenOnUncaughtException = () => {
        process.once('uncaughtException', err => {
            console.log(`Caught exception: ${err}`);

            this.logger.log({
                level: 'error',
                message: `LedController.listenOnUncaughtException Caught exception : ${err}`
            });

            // this.#isExceptionOccured = true;
            //
            // process.exit();
        });
    }

    #listenOnExit = (gpioSession) => {
        // code can be a param for the callback
        process.once('exit', () => {
            if (this.#isExceptionOccured) {
                this.logger.log({
                    level: 'info',
                    message: 'LedDriver.#listenOnExit Exception occured'
                });
            } else this.logger.log({level: 'info', message: 'LedDriver.listenOnExit Kill signal received'});

            this.tearUpGpios(gpioSession)
        });
    }

    #setIsLedLit = (gpioSession) => {
        this.#isLedLit = this.#readFromGpioPin({gpioSession, pinId: this.PIN_12})
    }

    #writeInGpioPin = ({gpioSession, pinId, pinValue}) => {
        gpioSession.write(pinId, pinValue, (err) => {
            if (err) {
                this.logger.log({
                    level: 'error',
                    message: `LedController.#writeInGpioPin Exception occured: ${err}`
                });
            }

            this.logger.log({
                level: 'info',
                message: `LedDriverGpioRpiGpioImplementation.#writeInGpioPin wrote ${pinValue} to pin ${pinId}`
            })
        });
    }

    #readFromGpioPin = ({gpioSession, pinId, callback}) => {
        let pinValue = null

        gpioSession.read(pinId, (err, value) => {
            if (err) throw err

            pinValue = value
            this.logger.log({level: 'info', message: `the value of pin ${pinId} is: ${value}`})

            if (callback) callback(gpioSession, value)
        })

        return pinValue
    }
}
