// implements: this class should actually send http requests to a simulated server.
// at the moment, it handles direct contact with the database (localStorage),
// so, missing server and backend.
// each table in the database is treated like a JSON object.
// Each row MUST have a primary key called "id".
// HTTPRequest will handle parsing from JSON objects to strings and viceversa.
// in future implementations, will throw HTTPResponses.
class HTTPRequest {

    get(table, id) {
        if(id === null || id <= 0) throw new Error("server error: invalid id");
        let queryResult = JSON.parse(localStorage.getItem(table) ?? "{}");
        return id === undefined ? queryResult : queryResult[id];
    }

    post(table, object) {
        if(object === null || object.id === null || object.id <= 0) throw new Error("server error: invalid object");
        let queryResult = JSON.parse(localStorage.getItem(table) ?? "{}");
        // already exists: cannot insert
        if(queryResult[object.id] !== null) throw new Error("database error: insert error");
        queryResult[object.id] = object;
        localStorage.setItem(table, JSON.stringify(queryResult));
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
        if(id === null || id <= 0) throw new Error("server error: invalid id");
        let queryResult = JSON.parse(localStorage.getItem(table) ?? "{}");
        // just for optimization purposes: not needed
        if(queryResult[object.id] !== null) {
            delete queryResult[object.id];
            localStorage.setItem(table, JSON.stringify(queryResult));
        }
    }

    // IMPLEMENT: like put, but single fields
    // I could maybe only update fields which are not null/undefined
    patch(key, object) {

    }

}

export default new HTTPRequest();