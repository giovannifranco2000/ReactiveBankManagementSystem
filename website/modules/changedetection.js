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

    registerContainer(eventName, containerClass) {
        let container = document.querySelector("." + containerClass);
        if(container !== null) this.#_containers[eventName] = container;
    }

    listen() {
        reactor.addEventListener("render_accounts", (event, arg) => {
            let container = this.#_containers[event.name];
            if(container) {
                if(typeof arg === "number") {

                    container.querySelector(`[data-id="${arg}"]`).remove();
                
                } else if(arg instanceof HTMLElement) {

                    // IMPLEMENT: UPDATE
                    let oldElement = container.querySelector(`[data-id="${arg.dataset.id}"]`)
                    oldElement ? oldElement.replaceWith(arg) : container.appendChild(arg);

                } else if(Array.isArray(arg)) {

                    container.innerHTML = "";
                    for(let node of arg) container.appendChild(node);

                } else console.warn("illegal event call: illegal argument type, no action expected\n" + event)  
            } else console.warn("illegal event call: container not found, no action expected\n" + event)   
        })
    }

}

export default ChangeDetection.instance;