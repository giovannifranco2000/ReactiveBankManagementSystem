import { default as reactor } from "/modules/js_framework/reactive.js";

export class Api {

    // SINGLETON
    static #_instance;

    constructor() {
        super();
        if(Api.#_instance) throw new Error("Cannot instantiate multiple instances of " + this.constructor.name);
        Api.#_instance = this;
    }

    static get instance() {
        if(!Api.#_instance) Api.#_instance = new Api();
        return Api.#_instance;
    }

    // routes handle methods follow naming conventions: methodName + urlMapping
    #_routes = {
        "get": {
            "/account-details": this.getAccountDetails,
            "/transaction-list": this.getTransactionList
        },
        "post": {

        },
        "put": {

        },
        "delete": {

        },
        "patch": {

        }
    }

    map() {
        reactor.addEventListener("http", (event, httpRequest) => {
            routes[httpRequest.method][httpRequest.url]();
        });
    }

    getAccountDetails() {

    }

    getTransactionList() {
        
    }

}

export default Api.instance;