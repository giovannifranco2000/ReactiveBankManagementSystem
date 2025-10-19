import { Serializable } from "/website/modules/reflective.js";

// most validity checks will be handled in backend directly.
// only enums are defined in frontend as well, for user friendly insertion

// getter and setter names must match the names of database columns, for proper object hydration

export const Gender = Object.freeze({
    M: Symbol("m"),
    F: Symbol("f")
});

export const DocumentType = Object.freeze({
    IDENTITY_CARD: Symbol("identity_card"),
    DRIVERS_LICENCE: Symbol("drivers_licence"),
    PASSPORT: Symbol("passport")
});

export const AccountStatus = Object.freeze({
    ACTIVE: Symbol("active"),
    CLOSED: Symbol("closed"),
    SUSPENDED: Symbol("suspended")
});

export const TransactionStatus = Object.freeze({
    FULFILLED: Symbol("fulfilled"),
    PENDING: Symbol("pending"),
    REJECTED: Symbol("rejected")
});

class Entity extends Serializable {
    #_id;

    constructor(id) {
        super();
        this.#_id = id;
    }

    get id() {
        return this.#_id;
    }

    set id(id) {
        this.#_id = id;
    }

    // entities must only have private attributes with public getters
    toJSON() {

        const json = {};

        let prototype = Object.getPrototypeOf(this);

        const getterNames = [];
        while(prototype && prototype !== Entity.prototype) {
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

export class AccountHolder extends Entity {
    #_firstName;
    #_lastName;
    #_dateOfBirth;
    #_birthPlace;
    #_gender;
    #_address;
    #_documentType;
    #_documentId;
    #_cellphone;
    #_email;
    #_cf;

    constructor(id, firstName, lastName, dateOfBirth, birthPlace, gender, address, documentType, documentId, cellphone, email, cf) {
        super(id);
        this.#_firstName = firstName;
        this.#_lastName = lastName;
        this.#_dateOfBirth = dateOfBirth;
        this.#_birthPlace = birthPlace;
        this.#_gender = gender;
        this.#_address = address;
        this.#_documentType = documentType;
        this.#_documentId = documentId;
        this.#_cellphone = cellphone;
        this.#_email = email;
        this.#_cf = cf;
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

    get birth_place() {
        return this.#_birthPlace;
    }

    set birth_place(birthPlace) {
        this.#_birthPlace = birthPlace;
    }

    get gender() {
        return this.#_gender;
    }

    set gender(gender) {
        if(!Object.values(Gender).includes(gender)) throw new TypeError("error: only Gender enum values accepted")
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
        if(!Object.values(DocumentType).includes(documentType)) throw new TypeError("error: only DocumentType enum values accepted")
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

}

export class Transaction extends Entity {
    #_remitterIban;
    #_beneficiaryIban;
    #_amount;
    #_transactionDate;
    #_status;

    constructor(id, remitterIban, beneficiaryIban, amount, transactionDate, status) {
        super(id);
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
        if(!Object.values(TransactionStatus).includes(status)) throw new TypeError("error: only TransactionStatus enum values accepted")
        this.#_status = status;
    }

}

export class Account extends Entity {
    static NESTED_TYPES = {
        // same name as the getter, not the property itself!
        account_holder: AccountHolder,
        // represents the type contained inside the array
        transactions: Transaction
    };

    #_iban;
    #_accountNumber;
    // even though this corresponds to the primary key of another table in the database,
    // I don't need that table in my frontend application
    // (the logic for iban generation will be handled by the backend for security reasons)
    #_branch;
    // represents the 1:N relationship between account_holders(1) and accounts(N)
    #_accountHolder;
    #_balance;
    #_status;

    // represents the N:N relationship between an account and the transactions sent and received
    // since we don't need to distinguish between transactions sent and received
    // (we can filter the received data later on), we can represent the relationship with a flat array
    #_transactions;

    constructor(id, iban, accountNumber, branch, accountHolder, balance, status) {
        super(id);
        this.#_iban = iban;
        this.#_accountNumber = accountNumber;
        this.#_branch = branch;
        this.#_accountHolder = accountHolder;
        this.#_balance = balance;
        this.#_status = status;
    }

    get iban() {
        return this.#_iban;
    }

    set iban(iban) {
        this.#_iban = iban;
    }

    get account_number() {
        return this.#_accountNumber;
    }

    set account_number(accountNumber) {
        this.#_accountNumber = accountNumber;
    }

    get branch() {
        return this.#_branch;
    }

    set branch(branch) {
        this.#_branch = branch;
    }

    get account_holder() {
        return this.#_accountHolder;
    }

    set account_holder(accountHolder) {
        if(!(accountHolder instanceof AccountHolder)) throw new TypeError("error: only AccountHolder instances accepted");
        this.#_accountHolder = accountHolder;
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
        if(!Object.values(AccountStatus).includes(status)) throw new TypeError("error: only AccountStatus enum values accepted")
        this.#_status = status;
    }

    get transactions() {
        return this.#_transactions ?? [];
    }

    set transactions(transactions) {
        this.#_transactions = transactions;
    }
}