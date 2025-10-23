// IMPLEMENT: rewrite everything

// IMPLEMENT: table metadata (e.g. which key is primary)
// Each table of my database will then be a collection, instead of a json

// IMPLEMENT: support for multiple joins

// DEBUG: cuts parts off ibans in transactions (select)

class DqlParser {

    constructor() {
        throw new Error("Cannot instantiate multiple instances of " + this.constructor.name);
    }

    static extractClauses(query) {
        const clauses = ["select", "join", "on", "where", "from"];
        const regex = new RegExp(`(?:\\s|^)(${clauses.join('|')})(?=\\s|$)`, 'i');
        // queries must be correctly formatted, otherwise the method will fail
        const extractedClauses = query.split(regex).slice(1).map((clause) => clause.trim());
        return extractedClauses.reduce((acc, clause, index) => {
            if(index % 2 === 0) acc[clause.toLowerCase()] = extractedClauses[index+1];
            return acc;
        }, {});
    }

    static #parseCondition(condition, table1Name, table2Name) {
        const operators = {
            "and": "&&",
            "or": "||",
            "not": "!",
            " = ": " == "
        };

        const isJoin = table1Name && table2Name;
        const args = isJoin ? [table1Name, table2Name] : ["row"];

        const body = condition
            .replace(/\b(and|or|not)\b|(\s=\s)/gi, (match) => operators[match.toLowerCase()] || match)
            .replace(/\w+\.\w+/gi, (match) => {
                const [tableName, columnName] = match.split(".");
                return (isJoin ? tableName : "row") + (`["` + (isJoin ? (tableName + "_" + columnName) : columnName) + `"]`);
            });        

        return new Function(...args, "return " + body);
    }

    // example: select owners.* from owners inner join cars on owners.id = cars.id where owners.id > 5;
    // my database requires that table names be always specified before columns in a query, so as to simplify parsing
    // my database also requires that all selected columns be specified, so as to simplify parsing
    // ex. owners.id -> owners_id
    static executeDQL(query, schema) {
        const params = DqlParser.extractClauses(query);
        // "from" clause must exist
        // if "join" clause exists, "on" subclause must exist
        // (at the moment, only inner joins are supported - the keyword is join)
        let tableExpression = params["join"] ? 
            DqlParser.#innerJoin(schema, params["from"], params["join"], DqlParser.#parseCondition(params["on"], params["from"], params["join"])) : 
            DqlParser.#from(schema, params["from"]);

        if(params["where"]) tableExpression = DqlParser.#where(tableExpression, DqlParser.#parseCondition(params["where"]));

        // select must exist
        return DqlParser.#select(tableExpression, ...params["select"].split(",").map((param) => {
            const [tableName, columnName] = param.split(".").map((part) => part.trim());
            return params["join"] ? (tableName + "_" + columnName) : columnName;
        }));
    }

    static #from(schema, tableName) {
        return Object.values(schema[tableName]);
    }

    // example of sql join condition: owners inner join cars on owners.id = cars.id
    // example of js join condition: (row1, row2) => row1["col1"] === row2["col2"];
    static #innerJoin(schema, table1Name, table2Name, condition) {
        let table1 = DqlParser.#from(schema, table1Name);
        let table2 = DqlParser.#from(schema, table2Name);
        let prefix = (name) => name + "_";

        let join = [];
        table1.forEach((table1Row) => {
            table2.forEach((table2Row) => {
                const table1RowCopy = JSON.parse(JSON.stringify(table1Row));
                const table2RowCopy = JSON.parse(JSON.stringify(table2Row));
                Object.entries(table1RowCopy).forEach(([table1ColKey, table1ColValue]) => {
                    table1RowCopy[prefix(table1Name) + table1ColKey] = table1ColValue;
                    delete table1RowCopy[table1ColKey];
                });
                Object.entries(table2RowCopy).forEach(([table2ColKey, table2ColValue]) => {
                    table2RowCopy[prefix(table2Name) + table2ColKey] = table2ColValue;
                    delete table2RowCopy[table2ColKey];
                });
                if(condition(table1RowCopy, table2RowCopy)) {
                    join.push({...table1RowCopy, ...table2RowCopy});
                }
            });
        });
        return join;
    }

    // IMPLEMENT: Future proofing -> currently not supported
    static #crossJoin(schema, table1Name, table2Name) {
        return DqlParser.#innerJoin(schema, table1Name, table2Name, () => true);
    }

    // example of sql where condition: where owners.id = 3;
    // example of js where condition: (row) => row["col"] === 3 ;
    static #where(tableExpression, condition) {
        return tableExpression.filter((row) => condition(row));
    }

    static #select(tableExpression, ...columnsToKeep) {
        let select = [];
        tableExpression.forEach((row) => {
            select.push(Object.fromEntries(Object.entries(row).filter(([key, value]) => columnsToKeep.includes(key))));
        });
        return select;
    }

}

class DmlParser {

    // ex. insert owners set owners.id, owners.name values 3, Mark
    // ex. update owners set owners.name, owners.age values Mark, 35 where id = 3
    // ex. delete owners where id = 3
    // my database requires that table names be always specified before columns in a query, so as to simplify parsing
    static extractClauses(query) {
        const clauses = ["insert", "update", "delete", "from", "set", "where"];
        const regex = new RegExp(`(?:\\s|^)(${clauses.join('|')})(?=\\s|$)`, 'i');
        // queries must be correctly formatted, otherwise the method will fail
        const extractedClauses = query.split(regex).slice(1).map((clause) => clause.trim());
        return extractedClauses.reduce((acc, clause, index) => {
            if(index % 2 === 0) acc[clause.toLowerCase()] = extractedClauses[index+1];
            return acc;
        }, {});
    }

    static #parseCondition(condition) {
        const operators = {
            "and": "&&",
            "or": "||",
            "not": "!",
            " = ": " == "
        };

        const args = ["row"];

        const body = condition
            .replace(/\b(and|or|not)\b|(\s=\s)/gi, (match) => operators[match.toLowerCase()] || match)
            .replace(/\w+\.\w+/gi, (match) => {
                const [tableName, columnName] = match.split(".");
                return "row" + `["` + columnName + `"]`;
            });

        return new Function(...args, "return " + body);
    }

    static executeDML(query, schema, primaryKey) {

        const params = DmlParser.extractClauses(query);

        if(Object.keys(params).includes("insert")) {
            return DmlParser.#insert(schema, params["from"], params["set"].replaceAll(/\w+\./g, "").split(",").map((param) => param.trim()), params["insert"].split(",").map((param) => param.trim()), primaryKey);
        } else if(Object.keys(params).includes("update")) {
            DmlParser.#update(schema, params["from"], params["set"].replaceAll(/\w+\./g, "").split(",").map((param) => param.trim()), params["update"].split(",").map((param) => param.trim()), DmlParser.#parseCondition(params["where"]));
        } else if(Object.keys(params).includes("delete")) {
            return DmlParser.#delete(schema, params["from"], DmlParser.#parseCondition(params["where"]));
        } else throw new SyntaxError("sql error: unknown query")

    }

    static #from(schema, tableName) {
        return schema[tableName];
    }

    // DEBUG: only auto-increment supported at the moment
    // must support custom primary key insertion, as well
    // Also, primary key must be names "id": change that
    static #insert(schema, tableName, columnNames, values, primaryKey) {
        const table = DmlParser.#from(schema, tableName);
        const object = {};
        for(let i = 0; i < columnNames.length; i++) object[columnNames[i]] = values[i];
        // DEBUG: overrides every inserted id (that is, primary key)
        object["id"] = parseInt(primaryKey) + 1;
        table[object["id"]] = object;
        return object["id"];
    }

    static #update(schema, tableName, columnNames, values, condition) {
        const table = DmlParser.#from(schema, tableName);
        // Object.values contains a reference to the original objects
        // .filter() contains references to the original objects, as well
        const rowsToUpdate = Object.values(table).filter((row) => condition(row));
        // does not exist: cannot update
        if(rowsToUpdate.length === 0) throw new Error("database error: update error");
        rowsToUpdate.forEach((row) => {
            for(let i = 0; i < columnNames.length; i++) row[columnNames[i]] = values[i];
        });
        return rowsToUpdate.length;
    }

    static #delete(schema, tableName, condition) {
        const table = DmlParser.#from(schema, tableName);
        const rowsToDelete = Object.values(table).filter((row) => condition(row));
        rowsToDelete.forEach((row) => {
            delete table[row["id"]];
        });
        return rowsToDelete.length;
    }

}

// Giovanni's Query Language
/*
    GQL Syntax (clause order does not matter):
    INSERT: insert <value | ,> from <table_name> set <table.column | ,>
    UPDATE: update <value | ,> from <table_name> set <table.column | ,> where <condition(table.column)>
    DELETE: delete from <table_name> where <condition>
    SELECT: select <table.column | ,> from <table_name> [join <table_name> on <condition(table.column)>] [where <condition(table.column)>]

    Conditions:
    the operators and, or, not, =, >=, <= are all supported, but:
    - they must be surrounded by white spaces (e.g. <table.column> = <value>);
    - not must be used at the beginning of the expression, not in front of other operators,
      and negated composite conditions must be surrounded by parentheses
      (e.g. not (<table.column> < 100 || <table.column> > 500))

    Order of execution:
    1) from
    2) join
    3) where
    4) select
*/
export class GqlParser {

    // SINGLETON
    static #_instance;

    constructor() {
        if(GqlParser.#_instance) throw new Error("Cannot instantiate multiple instances of " + this.constructor.name);
        GqlParser.#_instance = this;
    }

    static get instance() {
        if(!GqlParser.#_instance) GqlParser.#_instance = new GqlParser();
        return GqlParser.#_instance;
    }

    getTables(query) {
        const tables = [];
        if(query.includes("select")) {
            const params = DqlParser.extractClauses(query);
            tables.push(params["from"]);
            if(params["join"]) tables.push(params["join"]);
        } else tables.push(DmlParser.extractClauses(query)["from"]);
        return tables;
    }

    executeQL(query, schema, primaryKey) {
        return query.includes("select") ? DqlParser.executeDQL(query, schema) : DmlParser.executeDML(query, schema, primaryKey);
    }

}