import { Interface } from "./abstractive.js";

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
        if(json === null || Array.isArray(json) || typeof json !== "object") return json;

        const object = Reflect.construct(type, []);
        const nestedTypes = type.NESTED_TYPES || {};
        for(const key of Object.keys(json)) {
            if(key in object){
                // the name of the key in value types must match the names of getters/setters,
                // not that of the property
                const nestedType = nestedTypes[key];
                const value = json[key];
                if(Array.isArray(value))
                    for(const index in value) value[index] = nestedType ? this.fromJSON(nestedType, value[index]) : value[index];
                // object hydration:
                object[key] = nestedType ? this.fromJSON(nestedType, value) : value;
            }
        }
        return object;
    }

    // expects to convert to DTOs
    // does not perform object hydration
    // IMPLEMENT: subforms should be treated as lists / objects,
    // therefore object hydration should be implemented
    static fromFormData(type, formData) {
        if(formData === null || !(formData instanceof FormData)) return formData;
        const object = Reflect.construct(type, []);
        for(const [key, value] of formData.entries()) {
            // the name of the key in value types must match the names of getters/setters,
            // not that of the property
            if(key in object) object[key] = formData.get(key);
        }
        return object;
    }

}

export class Serializable extends Interface {

    toJSON() { }

}