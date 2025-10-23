// IMPLEMENT: rewrite everything

import { GqlParser } from "./gql.js";

// each table in the database is treated like a JSON object.
// each object MUST have a primary key called "id".

export class Database {

    // SINGLETON
    static #_instance;

    constructor() {
        if(Database.#_instance) throw new Error("Cannot instantiate multiple instances of " + this.constructor.name);
        Database.#_instance = this;
    }

    static get instance() {
        if(!Database.#_instance) Database.#_instance = new Database();
        return Database.#_instance;
    }

    #_schema = {};
    #_primaryKeys = {};
    #_gqlParser = GqlParser.instance;

    #replace(query, ...params) {
        let paramIndex = 0;
        return query.replace(/\?/g, (match) => {
            return params[paramIndex++]
        });
    }

    select(query, ...params) {
        for(const table of this.#_gqlParser.getTables(query)) {
            // lazy loading: the table is requested only when necessary, and will continue being available ever since
            if(!this.#_schema[table]) this.#_schema[table] = JSON.parse(localStorage.getItem(table) ?? "{}");
        }
        return this.#_gqlParser.executeQL(this.#replace(query, ...params), this.#_schema);
        // return id === undefined ? this.#_schema[table] : { id : this.#_schema[table][id] };
    }

    // DEBUG: at the moment, primary key will always be auto-incremented
    // must support custom primary key insertion
    insert(query, ...params) {
        const table = this.#_gqlParser.getTables(query);

        // lazy loading: the table is requested only when necessary, and will continue being available ever since
        if(!this.#_schema[table]) this.#_schema[table] = JSON.parse(localStorage.getItem(table) ?? "{}");

        // DEBUG: primary key increment and detection logic is partly in Database, partly in GqlParsed: fix
        if(!this.#_primaryKeys[table])
            this.#_primaryKeys[table] = (Object.keys(this.#_schema[table]).length <= 0) ? 0 : 
                                        Object.keys(this.#_schema[table]).reduce((a, b) => a > b ? a : b);            

        const primaryKey = this.#_gqlParser.executeQL(this.#replace(query, ...params), this.#_schema, this.#_primaryKeys[table]);
        localStorage.setItem(table, JSON.stringify(this.#_schema[table]));
        return primaryKey;
    }

    update(query, ...params) {
        const table = this.#_gqlParser.getTables(query);
        // lazy loading: the table is requested only when necessary, and will continue being available ever since
        if(!this.#_schema[table]) this.#_schema[table] = JSON.parse(localStorage.getItem(table) ?? "{}");
        this.#_gqlParser.executeQL(this.#replace(query, ...params), this.#_schema);
        localStorage.setItem(table, JSON.stringify(this.#_schema[table]));
    }

    delete(query, ...params) {
        const table = this.#_gqlParser.getTables(query);
        // lazy loading: the table is requested only when necessary, and will continue being available ever since
        if(!this.#_schema[table]) this.#_schema[table] = JSON.parse(localStorage.getItem(table) ?? "{}");
        // not needed, only for optimization purposes
        if(this.#_gqlParser.executeQL(this.#replace(query, ...params), this.#_schema) > 0)
            localStorage.setItem(table, JSON.stringify(this.#_schema[table]));
    }

}

// IMPLEMENT: move somewhere else
const initial_transactions = {
    "1": {
        "id": 1,
        // Aria Chen (Savings) -> Ben Davis (Checking) - Internal Transfer
        "remitter_iban": "IT60B123456789000000000002",
        "beneficiary_iban": "IT60C123456789000000000003",
        "amount": 500.00,
        "transaction_date": "2025-10-22T09:30:00Z",
        "status": "fulfilled"
    },
    "2": {
        "id": 2,
        // Aria Chen (Checking) -> External Payment
        "remitter_iban": "IT60A123456789000000000001",
        "beneficiary_iban": "EXTERNAL_VENDOR_IBAN_A",
        "amount": 50.99,
        "transaction_date": "2025-10-22T10:15:00Z",
        "status": "fulfilled"
    },
    "3": {
        "id": 3,
        // External Deposit -> Chris Evans (Savings)
        "remitter_iban": "EXTERNAL_PAYCHECK_IBAN",
        "beneficiary_iban": "IT60D123456789000000000004",
        "amount": 1500.00,
        "transaction_date": "2025-10-22T11:45:00Z",
        "status": "fulfilled"
    },
    "4": {
        "id": 4,
        // Mia Lee (Credit) -> External Payment (Larger amount)
        "remitter_iban": "IT60F123456789000000000006",
        "beneficiary_iban": "EXTERNAL_BILL_COMPANY",
        "amount": 250.00,
        "transaction_date": "2025-10-22T14:00:00Z",
        "status": "fulfilled"
    },
    "5": {
        "id": 5,
        // Internal Payment: Chris Evans (Savings) -> Aria Chen (Savings)
        "remitter_iban": "IT60D123456789000000000004",
        "beneficiary_iban": "IT60B123456789000000000002",
        "amount": 25.00,
        "transaction_date": "2025-10-23T08:00:00Z",
        "status": "fulfilled"
    },
    "6": {
        "id": 6,
        // Large External Deposit
        "remitter_iban": "EXTERNAL_LARGE_DEPOSIT",
        "beneficiary_iban": "IT60B123456789000000000002",
        "amount": 5000.00,
        "transaction_date": "2025-10-23T10:00:00Z",
        "status": "pending" // Test a non-fulfilled status
    }
}

if(!localStorage.getItem("transactions")) localStorage.setItem("transactions", JSON.stringify(initial_transactions));

const initial_account_holders = 
{
    "1": {
        "id": 1,
        "first_name": "Aria",
        "last_name": "Chen",
        "date_of_birth": "1990-05-15",
        "birthplace": "Roma",
        "gender": "f",
        "address": "123 Maple St, Rome",
        "document_type": "identity_card",
        "document_id": "AB12345C",
        "cellphone": "333-1234567",
        "email": "a.chen@mail.it",
        "cf": "CHNRAM90E55H501F"
    },
    "2": {
        "id": 2,
        "first_name": "Ben",
        "last_name": "Davis",
        "date_of_birth": "1985-11-20",
        "birthplace": "Milano",
        "gender": "m",
        "address": "45 Oak Ave, Milan",
        "document_type": "drivers_licence",
        "document_id": "D9876543",
        "cellphone": "334-9876543",
        "email": "b.davis@mail.it",
        "cf": "DVSBNE85S20F205F"
    },
    "3": {
        "id": 3,
        "first_name": "Chris",
        "last_name": "Evans",
        "date_of_birth": "2000-01-01",
        "birthplace": "Napoli",
        "gender": "m",
        "address": "789 Pine Ln, Naples",
        "document_type": "passport",
        "document_id": "P3334445",
        "cellphone": "335-5678901",
        "email": "c.evans@mail.it",
        "cf": "EVNCHR00A01F912T"
    },
    "4": {
        "id": 4,
        "first_name": "Mia",
        "last_name": "Lee",
        "date_of_birth": "1975-08-25",
        "birthplace": "Torino",
        "gender": "f",
        "address": "101 Cedar Dr, Turin",
        "document_type": "identity_card",
        "document_id": "X112233Y",
        "cellphone": "336-2345678",
        "email": "m.lee@mail.it",
        "cf": "LEEMIA75M65L219J"
    }
};

if(!localStorage.getItem("account_holders")) localStorage.setItem("account_holders", JSON.stringify(initial_account_holders));

const initial_accounts = 
{
    "1001": {
        "id": 1001,
        "iban": "IT60A123456789000000000001",
        "account_number": "000000100100",
        "branch": "CAB11",
        "account_holder": 1,
        "balance": 500.50,
        "status": "active"
    },
    "1002": {
        "id": 1002,
        "iban": "IT60B123456789000000000002",
        "account_number": "000000100200",
        "branch": "CAB11",
        "account_holder": 1,
        "balance": 12000.00,
        "status": "active"
    },
    "1003": {
        "id": 1003,
        "iban": "IT60C123456789000000000003",
        "account_number": "000000100300",
        "branch": "CAB12",
        "account_holder": 2,
        "balance": 150.25,
        "status": "active"
    },
    "1004": {
        "id": 1004,
        "iban": "IT60D123456789000000000004",
        "account_number": "000000100400",
        "branch": "CAB12",
        "account_holder": 3,
        "balance": 5500.75,
        "status": "active"
    },
    "1005": {
        "id": 1005,
        "iban": "IT60E123456789000000000005",
        "account_number": "000000100500",
        "branch": "CAB11",
        "account_holder": 4,
        "balance": 30.00,
        "status": "suspended"
    },
    "1006": {
        "id": 1006,
        "iban": "IT60F123456789000000000006",
        "account_number": "000000100600",
        "branch": "CAB13",
        "account_holder": 4,
        "balance": 2500.00,
        "status": "active"
    }
};

if(!localStorage.getItem("accounts")) localStorage.setItem("accounts", JSON.stringify(initial_accounts));