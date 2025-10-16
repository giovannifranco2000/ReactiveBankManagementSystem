class Factory {

    // IMPLEMENT: use Object.prototype a/o Reflect.construct to assign nested objects
    make(type, ...args) {
        return Object.assign(type, args);
    }

    unmake(object) {
        return JSON.parse(JSON.stringify(object));
    }

}