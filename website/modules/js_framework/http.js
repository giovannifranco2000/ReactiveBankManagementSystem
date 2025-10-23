import { default as reactor } from "./reactive.js";
import { default as api } from "/modules/server/api.js";

// IMPLEMENT: this class should only send http requests to a simulated server.
// at the moment, it serves as the server and backend at the same time.
// In future implementations, will throw HTTPResponses.

// IMPLEMENT: the server must implement some form of ORM,
// because my frontend expects fully populated JSON objects
// e.g. the backend should provide a JSON representing an account
// comprehensive of AccountHolder data, but not transactions (lazy loading)

// expects to handle DTOs
class HTTPRequest {

    constructor() {
        // IMPLEMENT: communication via http protocol is simulated through events
        // reactor.registerEvent("http");
    }

    get(url, param) {
        return api.routes["get"][url].call(api, param);
    }

    post(url, object) {
        if(object === null) throw new Error("server error: invalid object");
        return api.routes["post"][url].call(api, object);
    }

    put(url, object) {
        if(object === null || object.id === null || object.id <= 0) throw new Error("server error: invalid object");
        // database errors propagate
        // this.#_database.update(this.#tableFromUrl(url), object);
    }

    delete(url, id) {
        // just for optimization purposes: not needed
        if(id === null || id <= 0) throw new Error("server error: invalid id");
        api.routes["delete"][url].call(api, id);
    }

    // IMPLEMENT: like put, but single fields
    // I could maybe only update fields which are not null/undefined
    patch(key, object) {

    }

}

export default new HTTPRequest();