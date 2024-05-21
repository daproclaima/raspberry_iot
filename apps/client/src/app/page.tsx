"use client"

import { useState } from "react";

export default function Home() {
    const [isLedOn, setIsLedOn] = useState(false);

    const switchLed = async () => {
        const value = !isLedOn
        const message = value ? 'SWITCH_OFF_LED' : 'SWITCH_ON_LED';

        try {
            const response = await fetch('/api/mqtt', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    topic: 'LED/CONTROL',
                    message: message,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to publish MQTT message');
            }
            setIsLedOn(value)
        } catch (error) {
            console.error('Error:', error);
        }
    };


    return (
        <main className={'container'}>
            <button
                type="button"
                className={isLedOn ? 'button-green' : 'button-red'}
                role='button'
                onClick={switchLed}
            >
                {isLedOn ? 'ON' : 'OFF'}
            </button>
        </main>
    );
}
