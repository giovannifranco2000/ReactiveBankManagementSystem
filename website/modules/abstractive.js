// There are different ways to design interfaces in javascript:
// - DUCK TYPING CHECKER (what I used here) (https://medium.com/@eamonocallaghan/what-is-duck-typing-in-javascript-f3eb10853361)
// - JSDOC DECORATORS (or typescript compiler)
// - MIXINS (or function composition) (https://javascript.info/mixins)

// this class defines the behavior of an interface
// any class that extends Interface will be an interface, and its methods are all going to be considered abstract
// subclasses of interfaces will be checked at runtime to have implemented all the methods defined in the interface they extend

// IMPLEMENT: find a way to distinguish between abstract methods and concrete methods (abstract class)

export class Interface {

    #abstractMethodNames = [];
    prototype;

    get abstractMethodNames() {
        return this.#abstractMethodNames;
    }

    getInterface() {
        let currentConstructor = this.constructor;
        while(Object.getPrototypeOf(currentConstructor) !== Interface) currentConstructor = Object.getPrototypeOf(currentConstructor);
        return currentConstructor;
    }

    #isImplemented() {
        return this.#abstractMethodNames.every((methodName) => this.getAbstractMethodNames().includes(methodName));
    }

    #registerAbstractMethod(abstractMethod) {
        this.#abstractMethodNames.push(abstractMethod);
    }

    getAbstractMethodNames() {
        return Object.getOwnPropertyNames(this.prototype)
               .filter((propertyName) => propertyName !== "constructor" && typeof this.prototype[propertyName] === 'function');
    }

    constructor() {
        this.prototype = Object.getPrototypeOf(this);
        this.getInterface().prototype["getAbstractMethodNames"].bind(this.getInterface()).call().forEach((method) => this.#registerAbstractMethod(method));
        if(!this.#isImplemented()) throw new SyntaxError("error: all abstract methods must be implemented")
    }

}