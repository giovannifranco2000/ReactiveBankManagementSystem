import { default as sqlParser } from "./sqlparser.js";

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

    update(table, object) {
        // lazy loading: the table is requested only when necessary, and will continue being available ever since
        if(!this.#_schema[table]) this.#_schema[table] = JSON.parse(localStorage.getItem(table) ?? "{}");
        // does not exist: cannot update
        if(!this.#_schema[table][object.id]) throw new Error("database error: update error");
        this.#_schema[table][object.id] = object;
        localStorage.setItem(table, JSON.stringify(this.#_schema[table]));
    }

    delete(table, id) {
        // lazy loading: the table is requested only when necessary, and will continue being available ever since
        if(!this.#_schema[table]) this.#_schema[table] = JSON.parse(localStorage.getItem(table) ?? "{}");
        // just for optimization purposes: not needed
        if(this.#_schema[table][id]) {
            delete this.#_schema[table][id];
            localStorage.setItem(table, JSON.stringify(this.#_schema[table]));
        }
    }

}

// IMPLEMENT: move somewhere else
const initial_transactions = {
    1: {
        id: 1,
        remitter_iban: 'IT60X0542848988350000100000',
        beneficiary_iban: 'IT60Y0542848988350000200000',
        amount: 100.00,
        transaction_date: '2025-10-21T10:00:00Z',
    },
    2: {
        id: 2,
        remitter_iban: null,
        beneficiary_iban: 'IT60X0542848988350000100000',
        amount: 500.00,
        transaction_date: '2025-10-21T11:30:00Z',
    },
    3: {
        id: 3,
        remitter_iban: 'IT60Y0542848988350000200000',
        beneficiary_iban: null,
        amount: 25.00,
        transaction_date: '2025-10-21T14:00:00Z',
    },
    4: {
        id: 4,
        remitter_iban: 'IT60X0542848988350000100000',
        beneficiary_iban: 'EXTERNAL_IBAN_EXAMPLE_123',
        amount: 50.00,
        transaction_date: '2025-10-22T09:15:00Z',
    }
}

if(!localStorage.getItem("transactions")) localStorage.setItem("transactions", JSON.stringify(initial_transactions));