import { Interface } from "/website/modules/abstractive.js";

export class DaoInterface extends Interface {

    create() { }

    read() { }

    update() { }

    delete() { }

}

export class ServiceInterface extends Interface {

    get() { }

    put() { }

    delete() { }

}

export class ControllerInterface extends Interface {

    save() { }

    remove() { }

    find() { }

}