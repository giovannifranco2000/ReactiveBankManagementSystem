class Factory {

    // IMPLEMENT: use Object.prototype a/o Reflect.construct to assign nested objects
    fromJSON(type, ...args) {
        return Object.assign(type, args);
    }

    toJSON(object) {
        return JSON.parse(JSON.stringify(object));
    }

}