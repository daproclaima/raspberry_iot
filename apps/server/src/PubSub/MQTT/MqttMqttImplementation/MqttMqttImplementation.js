import mqtt from "mqtt";

const CONNECT = 'connect'
const OPEN = 'open'
const MESSAGE = 'message'
const CLOSE = 'close'
const ERROR = 'error'

// https://www.donskytech.com/mqtt-node-js/
export default class MqttMqttImplementation {
    #loggerService = null
    #server = null
    #connection
    

    constructor({loggerService}) {
        if(!loggerService.log) {
            throw new Error('loggerService provided in MqttMqttImplementation constructor has no log method')
        }
        this.#loggerService = loggerService

        this.#loggerService.log({
            level: 'info',
            message: 'MqttMqttImplementation.constructor executed successfully',
        })
    }

    listen = ({callbackOnError, callbackOnConnection, callbackOnMessage, callbackOnOpen, callbackOnClose, arraySubscribedTopics = ["LED/CONTROL"]}) => {
        const host = process.env.MQTT_BROKER_URL;
      
        const options = {
          keepalive: 60,
          protocolId: "MQTT",
          protocolVersion: 4,
          clean: true,
          reconnectPeriod: 1000,
          connectTimeout: 30 * 1000,
        };

        this.#server = mqtt.connect(host, options);

        
        this.#server.on(CONNECT, () => {
            this.#loggerService.log({
                level: 'info',
                message: 'MqttMqttImplementation is listening'
            })
            
            this.#server.isAlive = true;


            const socket = {connection: null, request: null, client: null, server: this.#server}
            callbackOnConnection({socket})

            arraySubscribedTopics.map(topic => {
                this.#server.subscribe(topic)
            })
        });

        this.#server.on(MESSAGE, (topic, message) => {
            console.log('topic: ', topic)
            const data = JSON.stringify({topic, message})
            console.log('received: %s', data);
        
            this.#loggerService.log({
                level: 'info',
                message: "MqttMqttImplementation.listened message"
            })

            const socket = {connetion: null, request: null, client: null, server: this.#server}
            callbackOnMessage({socket, data})
        })

        this.#server.on(ERROR, (error) => {
            this.#loggerService.log({
                level: 'info',
                message: `MqttMqttImplementation.listened error : ${error}`
            })

            const socket = {connection: null, request: null, client: null, server: this.#server}
            callbackOnError({socket, error})
        });

        this.#server.on(CLOSE, () => {
            this.#loggerService.log({
                level: 'info',
                message: "MqttMqttImplementation.listened close"
            })

            const socket = {connetion: null, request: null, client: null, server: this.#server}
            callbackOnClose({socket})
        });

        return this
    }

    reply = (response) => {
        if(!this.#server.isAlive) {
            throw new Error("MqttMqttImplementation connection is not alive.")
        }

        const payload = {topic: response.topic, message: response.message}

        this.#server.publish(payload)
        this.#loggerService.log({level: 'info', message: `MqttMqttImplementation.reply sent: ${JSON.stringify(payload)}`})

        return this
    }

    closeConnection = () => {
        this.#server.end()
        this.#server.isAlive = false
        this.#loggerService.log({level: 'info', message: 'MqttMqttImplementation server terminated'})

        return this
    }
}
