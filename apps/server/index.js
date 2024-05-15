// import {wssConfig} from "./src/PubSub/WebSocket/WsWebSocketImplementation/wssConfig.js";
import WinstonLoggerImplementation from "./src/Logger/WinstonImplementation/WinstonLoggerImplementation.js";
import {winstonConfiguration} from "./src/Logger/WinstonImplementation/winstonConfiguration.js";
// import WsWebSocketImplementation
//     from "./src/PubSub/WebSocket/WsWebSocketImplementation/WsWebSocketImplementation.js";
import {ApplicationService} from "./src/application/ApplicationService.js";
import LoggerService from "./src/Logger/LoggerService.js";
import PubSubServerService from "./src/PubSub/PubSubServerService.js";
import {GpioService} from "./src/GPIO/GpioService.js";
import DriverGpioOnOffImplementation from "./src/GPIO/DriverGpioOnOffImplementation/DriverGpioOnOffImplementation.js";
import {MicrophoneMicImplementation} from "./src/Microphone/MicrophoneMicImplementation.js";
import MicrophoneService from "./src/Microphone/MicrophoneService.js";
import LedService from "./src/LED/LedService.js";
import MqttMqttImplementation from "./src/PubSub/MQTT/MqttMqttImplementation/MqttMqttImplementation.js";
import "dotenv/config";

let winstonLoggerImplementation = null;
let loggerService = null;

const startApplication = () => {
    // https://github.com/winstonjs/winston#logging-levels
    winstonLoggerImplementation = new WinstonLoggerImplementation({winstonConfiguration})
    loggerService = new LoggerService({loggerImplementation: winstonLoggerImplementation})

    // const pubSubServerImplementation = new WsWebSocketImplementation({wssConfig, loggerService})
    const pubSubServerImplementation = new MqttMqttImplementation({loggerService})
    const pubSubServerService = new PubSubServerService({pubSubServerImplementation, loggerService})

    const gpioDriver = new DriverGpioOnOffImplementation({loggerService})
    const gpioService = new GpioService({loggerService, gpioDriver})

    const microphoneImplementation = new MicrophoneMicImplementation({loggerService})
    const microphoneService = new MicrophoneService({gpioService, loggerService, microphoneImplementation})

    const ledService = new LedService({
        loggerService,
        gpioService,
        pubSubServerService,
        microphoneService,
    })

    const applicationService = new ApplicationService({
        loggerService,
        pubSubServerService,
        gpioService,
        microphoneService,
        ledService
    })

    applicationService.start();

    process.on('SIGTERM', () => {
        applicationService.stop()
        process.exit(0);
    });
    process.on('SIGINT', () => {
        applicationService.stop()
        process.exit(0);
    });
}

try {
    startApplication()
} catch (error) {
    loggerService?.log({level: "error", message: `index.js :${error}`}) || console.error(`index.js error : ${error}`)
    process.exit(0);
}
