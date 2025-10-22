import { default as reactor } from "./reactive.js";
import { Database } from "/modules/server/database.js";

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
        // communication via http protocol is simulated through events
        reactor.registerEvent("http");
    }

    #_database = new Database();

    // IMPLEMENT: in future solutions, there needs to be a url mapping system
    // in the simulated server
    #tableFromUrl(url) {
        if(url === "/api/accounts") return "accounts";
        else if(url === "/api/transactions") return "transactions";
        // IMPLEMENT: the simulated server should return an HttpResponse with status code 404
        else throw new SyntaxError("error: page not found")
    }

    get(url, id) {
        if(id === null || id <= 0) throw new Error("server error: invalid id");
        return this.#_database.select(this.#tableFromUrl(url), id);
    }

    post(url, object) {
        if(object === null) throw new Error("server error: invalid object");
        // database errors propagate
        return this.#_database.insert(this.#tableFromUrl(url), object);
    }

    put(url, object) {
        if(object === null || object.id === null || object.id <= 0) throw new Error("server error: invalid object");
        // database errors propagate
        this.#_database.update(this.#tableFromUrl(url), object);
    }

    delete(url, id) {
        // just for optimization purposes: not needed
        if(id === null || id <= 0) throw new Error("server error: invalid id");
        this.#_database.delete(this.#tableFromUrl(url), id);
    }

    // IMPLEMENT: like put, but single fields
    // I could maybe only update fields which are not null/undefined
    patch(key, object) {

    }

}

export default new HTTPRequest();