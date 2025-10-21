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

    toString() {
        return "[ event: " + this.name + " ]";
    }

}

export class Reactor {

    // SINGLETON
    static #_instance;

    constructor() {
        if(Reactor.#_instance) throw new Error("Cannot instantiate multiple instances of " + this.constructor.name);
        Reactor.#_instance = this;
        this.events = {};
    }

    static get instance() {
        if(!Reactor.#_instance) Reactor.#_instance = new Reactor();
        return Reactor.#_instance;
    }

    events;

    registerEvent(eventName) {
        this.events[eventName] = new Event(eventName);
    }

    dispatchEvent(eventName, ...eventArgs) {
        this.events[eventName].callbacks.forEach((callback) => callback(this.events[eventName], ...eventArgs)); 
    }

    addEventListener(eventName, callback) {
        this.events[eventName].registerCallback(callback);
    }

}

export default Reactor.instance;