export class Factory {

    // IMPLEMENT: in future versions of the application,
    // HTTP requests and responses might be handled in an asynchronous way
    /* async fromJSON(type, json) {
        const object = Reflect.construct(type, []);
        const nestedTypes = type.NESTED_TYPES || {};
        for(const key of Object.keys(json)) {
            if(key in object){
                // the name of the key in value types must match the names of getters/setters,
                // not that of the property
                const nestedType = nestedTypes[key];
                // object hydration:
                object[key] = nestedType ? await this.fromJSON(nestedType, json[key]) : json[key];
            }
        }
        return object;
    } */

    static fromJSON(type, json) {
        const object = Reflect.construct(type, []);
        const nestedTypes = type.NESTED_TYPES || {};
        for(const key of Object.keys(json)) {
            if(key in object){
                // the name of the key in value types must match the names of getters/setters,
                // not that of the property
                const nestedType = nestedTypes[key];
                // object hydration:
                object[key] = nestedType ? this.fromJSON(nestedType, json[key]) : json[key];
            }
        }
        return object;
    }

    static toJSON(object) {
        return JSON.parse(JSON.stringify(object));
    }

}