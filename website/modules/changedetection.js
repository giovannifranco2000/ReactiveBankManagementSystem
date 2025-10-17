import { default as reactor } from "/website/modules/reactive.js";

// for accounts:
// will listen to render events and handle them depending on their arguments
// 1 argument (node) -> add to list or update existing node
// 1 argument (number) -> delete from list
// 1 argument (collection of nodes) -> render all

class ChangeDetection {

    // SINGLETON
    static #_instance;

    constructor() {
        if(ChangeDetection.#_instance) throw new Error("Cannot instantiate multiple instances of " + this.constructor.name);
        ChangeDetection.#_instance = this;
        reactor.registerEvent("render_accounts");
        this.#_containers = {};
        this.listen();
    }

    static get instance() {
        if(!ChangeDetection.#_instance) ChangeDetection.#_instance = new ChangeDetection();
        return ChangeDetection.#_instance;
    }

    #_containers;

    // IMPLEMENT: could be a solution to the change detection issue below
    registerContainer(eventName, containerClass) {
        let container = document.querySelector("." + containerClass);
        if(container !== null) this.#_containers[eventName] = container;
    }

    listen() {
        reactor.addEventListener("render_accounts", (event, ...eventArgs) => {
            if(eventArgs.length === 1) {
                if(eventArgs[0] instanceof Number) {

                } else if(eventArgs[0] instanceof HTMLElement) {
                    
                } else if(Array.isArray(eventArgs[0])) {

                } else console.warn("illegal event argument: no action expected\n" + event)
            }
        })
    }

}

export default ChangeDetection.instance;