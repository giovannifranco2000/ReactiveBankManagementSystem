class Factory {

    fromJSON(type, json) {
        const object = Reflect.construct(type, []);
        let result = Object.assign(object, json);
        // IMPLEMENT: object hydration -> each nested object should be assigned
        return result;
    }

    toJSON(object) {
        return JSON.parse(JSON.stringify(object));
    }

}