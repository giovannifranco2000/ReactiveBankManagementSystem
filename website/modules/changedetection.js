import { default as reactor } from "/website/modules/reactive.js";

// IMPLEMENT: when I turn the website into a Single Page Application,
// the virtual DOM will play a pivotal role. At the moment, it stops existing every time
// a new link is clicked, but, in the future, it will keep existing throughout all
// the pages of the website. Change Detection logic will be changed accordingly

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
        this.#_containers = {};
        this.#_virtualDoms = {};
        this.listen();
    }

    static get instance() {
        if(!ChangeDetection.#_instance) ChangeDetection.#_instance = new ChangeDetection();
        return ChangeDetection.#_instance;
    }

    #_containers;
    #_virtualDoms;

    registerContainer(eventName, containerClass) {
        let container = document.querySelector("." + containerClass);
        if(container) {
            this.#_containers[eventName] = container;
            this.#getVirtualDom(eventName).render(container);
        }
    }

    #getVirtualDom(eventName) {
        if(!this.#_virtualDoms[eventName]) this.#_virtualDoms[eventName] = new VirtualDom();
        return this.#_virtualDoms[eventName];
    }

    listen() {

        reactor.addEventListener("render_accounts", (event, arg) => {

            let container = this.#_containers[event.name];

            if(container) {

                if(typeof arg === "number") {

                    container.querySelector(`[data-id="${arg}"]`).remove();
                
                } else if(arg instanceof HTMLElement) {

                    let oldElement = container.querySelector(`[data-id="${arg.dataset.id}"]`)
                    oldElement ? oldElement.replaceWith(arg) : container.appendChild(arg);

                } else if(Array.isArray(arg)) {

                    container.innerHTML = "";
                    for(let node of arg) container.appendChild(node);

                }

            }

            let virtualDom = this.#getVirtualDom(event.name);

            if(typeof arg === "number") {

                virtualDom.remove(virtualDom.findByAttribute("data-id", `${arg}`));
            
            } else if(arg instanceof HTMLElement) {

                let oldIndex = virtualDom.findByAttribute("data-id", `${arg.dataset.id}`);
                oldIndex !== -1 ? virtualDom.replaceWith(oldIndex, arg) : virtualDom.appendChild(arg);

            } else if(Array.isArray(arg)) {

                virtualDom.empty();
                for(let node of arg) virtualDom.appendChild(node);

            } else console.warn("illegal event call: illegal argument type, no action expected\n" + event) 
        
        })

    }

}

// for simplicity's sake, each virtual DOM in my project
// will be represented as a flat array, instead of a tree
class VirtualDom {

    #nodeTree;

    constructor() {
        this.#nodeTree = [];
    }

    appendChild(node) {
        this.#nodeTree.push(node);
    }

    replaceWith(index, node) {
        this.#nodeTree[index] = node;
    }

    remove(index) {
        this.#nodeTree.splice(index, 1);
    }

    findByAttribute(attributeName, attributeValue) {
        return this.#nodeTree.findIndex((node) => node.getAttribute(attributeName) === attributeValue);
    }

    empty() {
        this.#nodeTree = [];
    }

    render(container) {
        this.#nodeTree.forEach((node) => container.appendChild(node.cloneNode(true)));
    }

}

export default ChangeDetection.instance;