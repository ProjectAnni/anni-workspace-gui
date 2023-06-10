const EVENT_CHANNEL_NAME = "anni_ws_gui";

interface Message {
    eventName: string;
    payload: any;
}

interface Listener<T = any> {
    (payload: T): void;
}

class EventBus {
    broadcaster: BroadcastChannel;

    receiver: BroadcastChannel;

    listeners: Record<string, Listener[]> = {};

    constructor() {
        this.broadcaster = new BroadcastChannel(EVENT_CHANNEL_NAME);
        this.receiver = new BroadcastChannel(EVENT_CHANNEL_NAME);

        this.receiver.onmessage = (event) => {
            this.onMessage(event.data);
        };
    }

    send(eventName: string, payload: any): void {
        this.broadcaster.postMessage({ eventName, payload });
    }

    private onMessage(message: Message) {
        const { eventName, payload } = message;

        if (this.listeners[eventName]?.length) {
            this.listeners[eventName].forEach((listener) => {
                listener(payload);
            });
        }
    }

    addEventListener<T>(eventName: string, listener: Listener<T>) {
        if (this.listeners[eventName]) {
            this.listeners[eventName].push(listener);
        } else {
            this.listeners[eventName] = [listener];
        }

        return () => {
            this.removeEventListener(eventName, listener);
        };
    }

    removeEventListener(eventName: string, listener: Listener) {
        if (!this.listeners[eventName]) {
            return;
        }
        this.listeners[eventName] = this.listeners[eventName].filter((l) => l !== listener);
    }
}

export default new EventBus();
