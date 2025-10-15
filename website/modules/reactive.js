class Event {

    name;
    callbacks;

    constructor(name) {
        this.name = name;
        this.callbacks = [];
    }

    registerCallback(callback) {
        this.callbacks.push(callback);
    }

}

export class Reactor {

    events;

    constructor() {
        this.events = {};
    }

    registerEvent(eventName) {
        this.events[eventName] = new Event(eventName);
    }

    dispatchEvent(eventName, eventArgs) {
        this.events[eventName].callbacks.forEach((callback) => callback(eventArgs)); 
    }

    addEventListener(eventName, callback) {
        this.events[eventName].registerCallback(callback);
    }

}

export default new Reactor();