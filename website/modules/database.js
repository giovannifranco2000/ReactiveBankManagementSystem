// each table in the database is treated like a JSON object.
// each object MUST have a primary key called "id".

export class Database {

    #_schema = {};
    #_primaryKeys = {};

    select(table, id) {
        // lazy loading: the table is requested only when necessary, and will continue being available ever since
        if(!this.#_schema[table]) this.#_schema[table] = JSON.parse(localStorage.getItem(table) ?? "{}");
        return id === undefined ? this.#_schema[table] : { id : this.#_schema[table][id] };
    }

    insert(table, object) {
        // lazy loading: the table is requested only when necessary, and will continue being available ever since
        if(!this.#_schema[table]) this.#_schema[table] = JSON.parse(localStorage.getItem(table) ?? "{}");
        if(!this.#_primaryKeys[table])
            this.#_primaryKeys[table] = (Object.keys(this.#_schema[table]).length <= 0) ? 0 : 
                                        Object.keys(this.#_schema[table]).reduce((a, b) => a > b ? a : b);
        // custom ids are accepted in inserts
        if(object.id) {
            // already exists: cannot insert
            if(this.#_schema[table][object.id]) throw new Error("database error: insert error");
            if(object.id > this.#_primaryKeys[table]) this.#_primaryKeys[table] = object.id;
        } else object.id = ++this.#_primaryKeys[table]; // auto_increment
        this.#_schema[table][object.id] = object;
        localStorage.setItem(table, JSON.stringify(this.#_schema[table]));
        return this.#_primaryKeys[table];
    }

    update(table) {
        // lazy loading: the table is requested only when necessary, and will continue being available ever since
        if(!this.#_schema[table]) this.#_schema[table] = JSON.parse(localStorage.getItem(table) ?? "{}");
    }

    delete(table) {
        // lazy loading: the table is requested only when necessary, and will continue being available ever since
        if(!this.#_schema[table]) this.#_schema[table] = JSON.parse(localStorage.getItem(table) ?? "{}");
    }

}