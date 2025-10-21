// There are different ways to design interfaces in javascript:
// - DUCK TYPING CHECKER (what I used here) (https://medium.com/@eamonocallaghan/what-is-duck-typing-in-javascript-f3eb10853361)
// - JSDOC DECORATORS (or typescript compiler)
// - MIXINS (or function composition) (https://javascript.info/mixins)

// this class defines the behavior of an interface
// any class that extends Interface will be an interface, and its methods are all going to be considered abstract
// subclasses of interfaces will be checked at runtime to have implemented all the methods defined in the interface they extend

export class Interface {

    static getMethodNames(prototype) {
        return Object.getOwnPropertyNames(prototype).filter((propertyName) => {
            const descriptor = Object.getOwnPropertyDescriptor(prototype, propertyName);
            return propertyName !== "constructor" && 
                   !(descriptor.get || descriptor.set) && 
                   typeof descriptor.value === 'function';
        });
    }

    static getAllMethodNames(prototype) {
        const methods = [];
        while(prototype && !(prototype === prototype.getInterfaceConstructor().prototype)) {
            methods.push(...Interface.getMethodNames(prototype));
            prototype = Object.getPrototypeOf(prototype);
        }
        return methods;
    }

    #abstractMethodNames = [];

    get abstractMethodNames() {
        return this.#abstractMethodNames;
    }

    getInterfaceConstructor() {
        let currentConstructor = this.constructor;
        while(Object.getPrototypeOf(currentConstructor) !== Interface) currentConstructor = Object.getPrototypeOf(currentConstructor);
        return currentConstructor;
    }

    #isImplemented() {
        return this.#abstractMethodNames.every((methodName) => Interface.getAllMethodNames(Object.getPrototypeOf(this)).includes(methodName));
    }

    #registerAbstractMethod(abstractMethod) {
        this.#abstractMethodNames.push(abstractMethod);
    }

    constructor() {
        this.getInterfaceConstructor()["getMethodNames"].call(this, Object.getPrototypeOf(this)).forEach((method) => this.#registerAbstractMethod(method));
        if(!this.#isImplemented()) throw new SyntaxError("error: all abstract methods must be implemented")
    }

}