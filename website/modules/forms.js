import { Interface } from "/website/modules/abstractive.js";

// TEMPLATE METHOD ANTI-PATTERN (ASYNCHRONOUS) (https://www.geeksforgeeks.org/system-design/template-method-design-pattern/)
// PROTOTYPE REFLECTION (see abstractive.js)
// this method works like a framework: 
// each specific subclass of FormInterface will only have to provide a promise defining:
// - a way to parse formData
// - a way to save the object using its dedicated Controller
// internal logic is reserved to forms.js and abstractive.js (inversion of control)

const ON_SUBMIT = Symbol("onSubmit");

export class FormInterface extends Interface {

    form;

    constructor(formNodeCallback) {
        super();
        this.form = formNodeCallback() ?? document.querySelector("form");
        this.getInterfaceConstructor().prototype[ON_SUBMIT].bind(this).call();
    }

    // allows the method not to be recognized as abstract by the interface
    // having a separate method makes the architecture more secure,
    // as there is no risk of stack overflow (by calling super.onSubmit() in the child class)
    [ON_SUBMIT]() {
        this.form.addEventListener("submit", (event) => {
            event.preventDefault();
            let formData = new FormData(event.target);
            this.onSubmit(formData)
            .then((result) => {})
            .catch((error) => console.error(error));
        });
    }

    onSubmit() { }

}

// OTHER WAYS TO ACHIEVE THE SAME RESULT:

// TEMPLATE METHOD ANTI-PATTERN (SYNCHRONOUS) (https://www.geeksforgeeks.org/system-design/template-method-design-pattern/)
// PROTOTYPE REFLECTION (see abstractive.js)

/* export class FormInterface extends Interface {

    #form;

    constructor(formNodeCallback) {
        super();
        this.#form = formNodeCallback() ?? document.querySelector("form");
        FormInterface.prototype.onSubmit.call(this);
    }

    onSubmit() {
        this.#form.addEventListener("submit", (event) => {
            event.preventDefault();
            let formData = new FormData(event.target);
            this.onSubmit(formData);
        });
    }

} */

// TEMPLATE METHOD PATTERN (SYNCHRONOUS) (https://www.geeksforgeeks.org/system-design/template-method-design-pattern/)
// JAVA STYLE (see abstractive.js)

/* export class FormInterface extends Interface {

    #form;

    constructor(formNodeCallback) {
        super();
        this.#form = formNodeCallback() ?? document.querySelector("form");
        this.onSubmit();
    }

    onSubmit() {
        this.#form.addEventListener("submit", (event) => {
            event.preventDefault();
            let formData = new FormData(event.target);
            this.saveModel(this.constructModel(formData));
        });
    }

    constructModel(formData) { }
    saveModel(model) { }

} */

// PROMISE-BASED DEPENDENCY INJECTION (ASYNCHRONOUS):
// onSubmit does not need to be overridden,
// as the data it needs will be passed directly from the child class through the constructor
// drawback: won't work if MVC logic is not asynchronous

/* export class Form {

    #form;

    constructor(formNodeCallback, constructPromiseHandler, savePromiseHandler) {
        this.#form = formNodeCallback() ?? document.querySelector("form");
        this.onSubmit(constructPromiseHandler, savePromiseHandler);
    }

    get form() {
        return this.#form;
    }

    onSubmit(constructPromiseHandler, savePromiseHandler) {
        this.#form.addEventListener("submit", (event) => {
            event.preventDefault();
            let formData = new FormData(event.target);
            constructPromiseHandler(formData)
            .then((object) => savePromiseHandler(object))
            .catch((error) => console.log(error));
        })
    }

} */

// CALLBACK-BASED DEPENDENCY INJECTION (SYNCHRONOUS):
// onSubmit does not need to be overridden,
// as the data it needs will be passed directly from the child class through the constructor

/* export class Form {

    #form;

    constructor(formNodeCallback, constructCallback, saveCallback) {
        this.#form = formNodeCallback() ?? document.querySelector("form");
        this.onSubmit(constructCallback, saveCallback);
    }

    get form() {
        return this.#form;
    }

    onSubmit(constructCallback, saveCallback) {
        this.#form.addEventListener("submit", (event) => {
            event.preventDefault();
            let formData = new FormData(event.target);
            saveCallback(constructCallback(formData));
        })
    }

} */