import { Database } from "/website/modules/database.js";

// IMPLEMENT: this class should only send http requests to a simulated server.
// at the moment, it serves as the server and backend at the same time.
// In future implementations, will throw HTTPResponses.

// IMPLEMENT: the server must implement some form of ORM,
// because my frontend expects fully populated JSON objects
// e.g. the backend should provide an JSON representing an account
// comprehensive of AccountHolder data, but not transactions (lazy loading)

// HTTPRequest handles parsing from JSON objects to strings and viceversa.
class HTTPRequest {

    #_database = new Database();

    get(table, id) {
        if(id === null || id <= 0) throw new Error("server error: invalid id");
        // database errors propagate
        return this.#_database.select(table, id);
    }

    post(table, object) {
        if(object === null) throw new Error("server error: invalid object");
        // database errors propagate
        return this.#_database.insert(table, object);
    }

    put(table, object) {
        if(object === null || object.id === null || object.id <= 0) throw new Error("server error: invalid object");
        let queryResult = JSON.parse(localStorage.getItem(table) ?? "{}");
        // does not exist: cannot update
        if(queryResult[object.id] === null) throw new Error("database error: update error");
        queryResult[object.id] = object;
        localStorage.setItem(table, JSON.stringify(queryResult));
    }

    delete(table, id) {
        // just for optimization purposes: not needed
        if(id === null || id <= 0) throw new Error("server error: invalid id");
        let queryResult = JSON.parse(localStorage.getItem(table) ?? "{}");
        // just for optimization purposes: not needed
        if(queryResult[id] !== null) {
            delete queryResult[id];
            localStorage.setItem(table, JSON.stringify(queryResult));
        }
    }

    // IMPLEMENT: like put, but single fields
    // I could maybe only update fields which are not null/undefined
    patch(key, object) {

    }

}

export default new HTTPRequest();