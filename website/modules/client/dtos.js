import { Serializable } from "/modules/js_framework/reflective.js";

// getter and setter names must match the names of database columns, for proper object hydration

export class AccountDetailsDto extends Serializable {

    #_id;
    #_firstName;
    #_lastName;
    #_dateOfBirth;
    #_birthplace;
    #_gender;
    #_address;
    #_documentType;
    #_documentId;
    #_cellphone;
    #_email;
    #_cf;
    #_iban;
    #_branch;
    #_balance;
    #_status;

    constructor(id, firstName, lastName, dateOfBirth, birthplace, gender, address, documentType, documentId, cellphone, email, cf, iban, branch, balance, status) {
        super();
        this.#_id = id;
        this.#_firstName = firstName;
        this.#_lastName = lastName;
        this.#_dateOfBirth = dateOfBirth;
        this.#_birthplace = birthplace;
        this.#_gender = gender;
        this.#_address = address;
        this.#_documentType = documentType;
        this.#_documentId = documentId;
        this.#_cellphone = cellphone;
        this.#_email = email;
        this.#_cf = cf;
        this.#_iban = iban;
        this.#_branch = branch;
        this.#_balance = balance;
        this.#_status = status;
    }

    get id() {
        return this.#_id;
    }

    set id(id) {
        this.#_id = id;
    }

    get first_name() {
        return this.#_firstName;
    }

    set first_name(firstName) {
        this.#_firstName = firstName;
    }

    get last_name() {
        return this.#_lastName;
    }

    set last_name(lastName) {
        this.#_lastName = lastName;
    }

    get date_of_birth() {
        return this.#_dateOfBirth;
    }

    set date_of_birth(dateOfBirth) {
        this.#_dateOfBirth = dateOfBirth;
    }

    get birthplace() {
        return this.#_birthplace;
    }

    set birthplace(birthplace) {
        this.#_birthplace = birthplace;
    }

    get gender() {
        return this.#_gender;
    }

    set gender(gender) {
        this.#_gender = gender;
    }

    get address() {
        return this.#_address;
    }

    set address(address) {
        this.#_address = address;
    } 

    get document_type() {
        return this.#_documentType;
    }

    set document_type(documentType) {
        this.#_documentType = documentType;
    }

    get document_id() {
        return this.#_documentId;
    }

    set document_id(documentId) {
        this.#_documentId = documentId;
    }

    get cellphone() {
        return this.#_cellphone;
    }

    set cellphone(cellphone) {
        this.#_cellphone = cellphone;
    }

    get email() {
        return this.#_email;
    }

    set email(email) {
        this.#_email = email;
    }

    get cf() {
        return this.#_cf;
    }

    set cf(cf) {
        this.#_cf = cf;
    }

    get iban() {
        return this.#_iban;
    }

    set iban(iban) {
        this.#_iban = iban;
    }

    get branch() {
        return this.#_branch;
    }

    set branch(branch) {
        this.#_branch = branch;
    }

    get balance() {
        return this.#_balance;
    }

    set balance(balance) {
        this.#_balance = balance;
    }

    get status() {
        return this.#_status;
    }

    set status(status) {
        this.#_status = status;
    }

    // entities must only have private attributes with public getters
    toJSON() {

        const json = {};

        let prototype = Object.getPrototypeOf(this);

        const getterNames = [];
        while(prototype && prototype !== Serializable.prototype) {
            Object.getOwnPropertyNames(prototype).forEach((name) => {
                const descriptor = Object.getOwnPropertyDescriptor(prototype, name);
                if(descriptor && descriptor.get) getterNames.push(name);
            });
            prototype = Object.getPrototypeOf(prototype);
        }

        for(const key of getterNames) {
            // calls the getter
            const value = this[key];

            json[key] = Array.isArray(value) ? value.map((item) => item && item.toJSON ? item.toJSON() : item)
                      : value && value.toJSON ? value.toJSON()
                      : typeof value === 'symbol' ? value.description
                      : value;
        }

        return json;

    }

}

export class TransactionDto extends Serializable {

    #_remitterIban;
    #_beneficiaryIban;
    #_amount;
    #_transactionDate;
    #_status;

    constructor(remitterIban, beneficiaryIban, amount, transactionDate, status) {
        super();
        this.#_remitterIban = remitterIban;
        this.#_beneficiaryIban = beneficiaryIban;
        this.#_amount = amount;
        this.#_transactionDate = transactionDate;
        this.#_status = status;
    }

    get remitter_iban() {
        return this.#_remitterIban;
    }

    set remitter_iban(remitterIban) {
        this.#_remitterIban = remitterIban;
    }

    get beneficiary_iban() {
        return this.#_beneficiaryIban;
    }

    set beneficiary_iban(beneficiaryIban) {
        this.#_beneficiaryIban = beneficiaryIban;
    }

    get amount() {
        return this.#_amount;
    }

    set amount(amount) {
        this.#_amount = amount;
    }

    get transaction_date() {
        return this.#_transactionDate;
    }

    set transaction_date(transactionDate) {
        this.#_transactionDate = transactionDate;
    }

    get status() {
        return this.#_status;
    }

    set status(status) {
        this.#_status = status;
    }

    // entities must only have private attributes with public getters
    toJSON() {

        const json = {};

        let prototype = Object.getPrototypeOf(this);

        const getterNames = [];
        while(prototype && prototype !== Serializable.prototype) {
            Object.getOwnPropertyNames(prototype).forEach((name) => {
                const descriptor = Object.getOwnPropertyDescriptor(prototype, name);
                if(descriptor && descriptor.get) getterNames.push(name);
            });
            prototype = Object.getPrototypeOf(prototype);
        }

        for(const key of getterNames) {
            // calls the getter
            const value = this[key];

            json[key] = Array.isArray(value) ? value.map((item) => item && item.toJSON ? item.toJSON() : item)
                      : value && value.toJSON ? value.toJSON()
                      : typeof value === 'symbol' ? value.description
                      : value;
        }

        return json;

    }

}