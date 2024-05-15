import winston from "winston";

export default class WinstonLoggerImplementation {
    #logger = null;

    constructor({winstonConfiguration}) {
        const logger = winston.createLogger(winstonConfiguration);

        if (process.env.NODE_ENV !== 'production') {
            logger.add(new winston.transports.Console({
                format: winston.format.simple(),
            }));
        }

        this.#logger = logger
    }

    log = (logObject) => {
        this.#logger.log(logObject)
    }

}
