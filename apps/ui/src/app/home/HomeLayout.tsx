"use client"

import {useEffect, useState} from "react";

import mqtt, {IClientOptions, MqttClient} from "mqtt";

let pubSubClient: {
    implementation: null | MqttClient,
    send: (topic: string, message: string) => void
} = {
    implementation: null,
    send: (topic: string, message: string) => {}
}

const mountMqttConnection = ({
         callbackOnConnection,
         callbackOnMessage,
         callbackOnError,
         callbackOnClose
     }: {
            callbackOnConnection: () => void,
            callbackOnMessage: ({topic, message}: {topic: string, message: string | Buffer}) => void,
            callbackOnError: ({error}: { error: Error }) => void,
            callbackOnClose: (event: any) => void
         }
    ) => {
    const clientId = "client" + Math.random().toString(36).substring(7);

    // Change this to point to your MQTT broker
    const host = String(process.env.NEXT_PUBLIC_MQTT_BROKER_URL);

    const options: IClientOptions = {
        keepalive: 60,
        //   clientId: clientId,
        protocolId: "MQTT",
        protocolVersion: 4,
        clean: true,
        reconnectPeriod: 1000,
        connectTimeout: 30 * 1000,
        username: process.env.NEXT_PUBLIC_MQTT_USER,
        password: process.env.NEXT_PUBLIC_MQTT_PASSWORD
    };

    const mqttClient: MqttClient = mqtt.connect(host, options)

    pubSubClient = {
        implementation: mqttClient,
        send: (topic: string, message: string) => {
            mqttClient.publish(topic, message)
        }
    }

    mqttClient.on("error", (error) => {
        callbackOnError({error})
    });

    // mqttClient.on("reconnect", () => {
    //   console.log("Reconnecting...");
    // });

    mqttClient.on("connect", () => {
        console.log("Client connected:" + clientId);
        callbackOnConnection()
    });

    // Received
    mqttClient.on("message", (topic, message, packet) => {
        console.log(
            "Received Message: " + message.toString() + "\nOn topic: " + topic
        );
        callbackOnMessage({topic, message})
    });

    return pubSubClient
}

export const HomeLayout = () => {
    const [isLedOn, setIsLedOn] = useState(false);

    const switchLed = async () => {
        const message = isLedOn ? 'SWITCH_OFF_LED' : 'SWITCH_ON_LED';

        try {
            if(pubSubClient) {
                pubSubClient.send('LED_SERVICE/MESSAGE', message)
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    // @ts-ignore
    const pubSubCallbackOnConnection = () => {
        // loggerClient.log({ level: 'info', message: "Home component connected to ws"})
        if(!pubSubClient.implementation) {
            throw new Error("No pubsub client.")
        }

        console.info("pubSubCallbackOnConnection successfully executed")

        pubSubClient.implementation.subscribe(['LED_SERVICE/RESPONSE'], { qos: 0 }, (error) => {
            if (error) {
                console.error(error)
                // pubSubClient.implementation?.publish("presence", "Hello mqtt");
            }
            pubSubClient.send('LED_SERVICE/MESSAGE', 'GET_STATE_LED')
        });
    }

    const pubSubCallbackOnMessage = ({topic, message}: {topic: string, message: string | Buffer}) => {
        if(topic === "LED_SERVICE/RESPONSE") {
            message = String(message.toString())

            console.log('HomeLayout.pubSubCallbackOnMessage message: ', message)
            // loggerClient.log({ level: 'info', message: `Home component pubSubCallbackOnMessage data: ${data}`})
            // LED ON
            // 'SWITCHED_ON_LED'
            // 'FAILED_SWITCH_OFF_LED'
            // 'STATE_LED_ON'

            // LED OFF
            // 'SWITCHED_OFF_LED'
            // 'FAILED_SWITCH_ON_LED'
            // 'TERMINATED_GPIO_LED'
            // 'STATE_LED_OFF'

            // UNKOWN
            // 'FAILED_TERMINATE_GPIO_LED'
            // 'UNEXPECTED_MESSAGE'
            // 'FAILED_GET_STATE_LED'
            switch (message) {
                case 'SWITCHED_ON_LED':
                case 'FAILED_SWITCH_OFF_LED':
                case 'STATE_LED_ON':
                    setIsLedOn(true);
                    break

                case 'SWITCHED_OFF_LED':
                case 'FAILED_SWITCH_ON_LED':
                case 'TERMINATED_GPIO_LED':
                case 'STATE_LED_OFF':
                    setIsLedOn(false)
                    break
            }

            console.log('HomeLayout.pubSubCallbackOnMessage executed successfully')
        }
    }

    useEffect(() => {
        pubSubClient = mountMqttConnection({
            callbackOnConnection: pubSubCallbackOnConnection,
            callbackOnMessage: pubSubCallbackOnMessage,
            callbackOnError: ({error}) => {
                console.error(error)
            },
            callbackOnClose: ({event}) => {console.log(event)},
        })
    },[])

    return (<main className={'container'}>
        <button
            type="button"
            className={isLedOn ? 'button-green' : 'button-red'}
            role='button'
            onClick={switchLed}
        >
            {isLedOn ? 'ON' : 'OFF'}
        </button>
    </main>)
}