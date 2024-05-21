// app/api/mqtt/route.js

import { NextResponse } from 'next/server';
import mqtt from 'mqtt';

let mqttClient: mqtt.MqttClient | null = null;

const connectMqtt = () => {
    const clientId = "server_ui";
    const host = process.env.NEXT_PUBLIC_MQTT_BROKER_URL ?? "";

    const options: mqtt.IClientOptions = {
        keepalive: 60,
        encoding: "utf-8",
        clientId,
        protocolId: "MQTT",
        protocolVersion: 4,
        clean: true,
        reconnectPeriod: 0,
        connectTimeout: 30 * 1000,
        username: process.env.NEXT_PUBLIC_MQTT_USER,
        password: process.env.NEXT_PUBLIC_MQTT_PASSWORD,
    };

    mqttClient = mqtt.connect(host, options);

    mqttClient.on("error", (err) => {
        console.log("Error: ", err);
    });

    mqttClient.on("connect", () => {
        console.log("Client connected:" + clientId);
    });

    mqttClient.on("message", (topic, message, packet) => {
        console.log("Received Message: " + message.toString() + "\nOn topic: " + topic);
    });
};

export async function POST(request: { json: () => PromiseLike<{ topic: any; message: any; }> | { topic: any; message: any; }; }) {
    if (!mqttClient) {
        connectMqtt();
    }

    const { topic, message } = await request.json();

    debugger

    return new Promise((resolve) => {
        if (mqttClient) {
            mqttClient.publish(topic, message, {}, (err) => {
                if (err) {
                    resolve(NextResponse.json({ error: 'Failed to publish message' }, { status: 500 }));
                } else {
                    resolve(NextResponse.json({ success: 'Message published' }, { status: 200 }));
                }
            });
        } else {
            resolve(NextResponse.json({ error: 'MQTT client not connected' }, { status: 500 }));
        }
    });
}
