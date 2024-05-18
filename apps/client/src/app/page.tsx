"use client"

import mqtt, {IClientOptions, MqttClient} from "mqtt";
import { useEffect, useState } from "react";
// import WebSocket from "ws";

let pubSubClient: {implementation: null | MqttClient, send: (topic: string, message: string) => void} = {implementation: null, send: (message) => {}}

export default function Home() {
    const [isLedOn, setIsLedOn] = useState(false)
    // const mountWebSocketConnection = () => {
    //     const webSocketClient = new WebSocket('ws://localhost:8080');
        
    //     pubSubClient = {
    //         implementation: webSocketClient,
    //         send: (message) => webSocketClient.send(message)
    //     }

    //     webSocketClient.onopen = (e) => {
    //         console.info("[open] Connection established");
    //     };

    //     webSocketClient.onmessage = (event) => {
    //         console.info(`[message] Data received from server: ${event.data}`)
    //     };
    // }

    const mountMqttConnection = () => {
        // https://github.com/mqttjs/mqtt-packet?tab=readme-ov-file#connect
        // const clientId = "client" + Math.random().toString(36).substring(7);
        const clientId = "ui"
        // Change this to point to your MQTT broker
        const host = process.env.NEXT_PUBLIC_MQTT_BROKER_URL;

        const options: IClientOptions = {
          keepalive: 60,
          clientId,
          protocolId: "MQTT",
          protocolVersion: 4,
          clean: true,
          reconnectPeriod: 60,
          keepAlive: 3600,
          connectTimeout: 30 * 1000,
        };
      
        const mqttClient: MqttClient = mqtt.connect(host, options)

        pubSubClient = {
            implementation: mqttClient, 
            send: (topic: string, message: string) => {
                mqttClient.publish(topic, message)
            }
    }
      
        mqttClient.on("error", (err) => {
          console.log("Error: ", err);
        //   mqttClient.end();
        });
      
        // mqttClient.on("reconnect", () => {
        //   console.log("Reconnecting...");
        // });
      
        mqttClient.on("connect", () => {
          console.log("Client connected:" + clientId);
        });
      
        // Received
        mqttClient.on("message", (topic, message, packet) => {
          console.log(
            "Received Message: " + message.toString() + "\nOn topic: " + topic
          );

        //   if(topic === "LED_CONTROL") {
        //       mqttClient.subscribe(topic, { qos: 0 });
        //   }

        //   const messageTextArea = document.querySelector("#message");
        //   messageTextArea.value += message + "\r\n";
        });
    }

    const switchLed = (isLedOn: boolean) => {
        if(pubSubClient) {
            if(!isLedOn) {
                pubSubClient.send('LED/CONTROL', 'SWITCH_ON_LED')
            } 
            if(isLedOn) {
                pubSubClient.send('LED/CONTROL', 'SWITCH_OFF_LED')
            }
        }
    }

    useEffect(() => {
        mountMqttConnection()
    }, [])

    useEffect(() => {
        switchLed(isLedOn)
    }, [isLedOn])

    return (
        <main className={'container'}>
          <button 
            type="button" 
            className={isLedOn ? 'button-green' : 'button-red'} 
            role='button' 
            onClick={() => setIsLedOn(isOn => !isOn)}
          >
            {isLedOn ? 'ON' : 'OFF'}
          </button>
        </main>
    )
}
