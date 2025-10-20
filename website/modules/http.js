import { Database } from "/website/modules/database.js";

// IMPLEMENT: this class should only send http requests to a simulated server.
// at the moment, it serves as the server and backend at the same time.
// In future implementations, will throw HTTPResponses.

// IMPLEMENT: the server must implement some form of ORM,
// because my frontend expects fully populated JSON objects
// e.g. the backend should provide a JSON representing an account
// comprehensive of AccountHolder data, but not transactions (lazy loading)

class HTTPRequest {

    #_database = new Database();

    get(table, id) {
        if(id === null || id <= 0) throw new Error("server error: invalid id");
        return this.#_database.select(table, id);
    }

    post(table, object) {
        if(object === null) throw new Error("server error: invalid object");
        // database errors propagate
        return this.#_database.insert(table, object);
    }

    put(table, object) {
        if(object === null || object.id === null || object.id <= 0) throw new Error("server error: invalid object");
        // database errors propagate
        this.#_database.update(table, object);
    }

    delete(table, id) {
        // just for optimization purposes: not needed
        if(id === null || id <= 0) throw new Error("server error: invalid id");
        this.#_database.delete(table, id);
    }

    // IMPLEMENT: like put, but single fields
    // I could maybe only update fields which are not null/undefined
    patch(key, object) {

    }

}

export default new HTTPRequest();