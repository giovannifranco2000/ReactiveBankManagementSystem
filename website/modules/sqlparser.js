// sql clauses: order of execution
// from / join
// where
// group by
// having
// select
// distinct
// order by
// limit

class SqlParser {

    // SINGLETON
    static #_instance;

    constructor() {
        if(SqlParser.#_instance) throw new Error("Cannot instantiate multiple instances of " + this.constructor.name);
        SqlParser.#_instance = this;
    }

    static get instance() {
        if(!SqlParser.#_instance) SqlParser.#_instance = new SqlParser();
        return SqlParser.#_instance;
    }

    #extractClauses(query) {
        const clauses = ["select", "join", "on", "where", "from"];
        const regex = new RegExp('(' + clauses.join('|') + ')', 'i');
        // queries must be correctly formatted, otherwise the method will fail
        const extractedClauses = query.split(regex).slice(1).map((clause) => clause.trim());
        return extractedClauses.reduce((acc, clause, index) => {
            if(index % 2 === 0) acc[clause.toLowerCase()] = extractedClauses[index+1];
            return acc;
        }, {});
    }

    #parseCondition(condition, table1Name, table2Name) {
        const operators = {
            "and": "&&",
            "or": "||",
            "not": "!",
            "=": "==="
        };

        const isJoin = table1Name && table2Name;
        const args = isJoin ? [table1Name, table2Name] : ["row"];

        const body = condition
            .replace(/\b(and|or|not)\b|=/gi, (match) => operators[match.toLowerCase()] || match)
            .replace(/\w+\.\w+/gi, (match) => {
                const [tableName, columnName] = match.split(".");
                return (isJoin ? tableName : "row") + `["` + tableName + "_" + columnName + `"]`;
            });

        return new Function(...args, "return " + body);
    }

    // example: select owners.* from owners inner join cars on owners.id = cars.id where owners.id > 5;
    // my database requires that table names be always specified before columns in a query, so as to simplify parsing
    // my database also requires that all selected columns be specified, so as to simplify parsing
    // ex. owners.id -> owners_id
    executeDQL(query, schema) {
        const params = this.#extractClauses(query);
        // "from" clause must exist
        // if "join" clause exists, "on" subclause must exist
        // (at the moment, only inner joins are supported - the keyword is join)
        let tableExpression = params["join"] ? 
            this.#innerJoin(schema, params["from"], params["join"], this.#parseCondition(params["on"], params["from"], params["join"])) : 
            this.#from(schema, params["from"]);

        if(params["where"]) tableExpression = this.#where(tableExpression, this.#parseCondition(params["where"]));

        // select must exist
        return this.#select(tableExpression, ...params["select"].split(",").map((param) => param.replace(".", "_")));
    }

    #from(schema, tableName) {
        return Object.values(schema[tableName]);
    }

    // example of sql join condition: owners inner join cars on owners.id = cars.id
    // example of js join condition: (row1, row2) => row1["col1"] === row2["col2"];
    #innerJoin(schema, table1Name, table2Name, condition) {
        let table1 = this.#from(schema, table1Name);
        let table2 = this.#from(schema, table2Name);
        let prefix = (name) => name + "_";

        let join = [];
        table1.forEach((table1Row) => {
            table2.forEach((table2Row) => {
                if(condition(table1Row, table2Row)) {
                    let newRow = {};
                    Object.entries(table1Row).forEach(([table1ColKey, table1ColValue]) => {
                        newRow[prefix(table1Name) + table1ColKey] = table1ColValue;
                    });
                    Object.entries(table2Row).forEach(([table2ColKey, table2ColValue]) => {
                        newRow[prefix(table2Name) + table2ColKey] = table2ColValue;
                    });
                    join.push(newRow);
                }
            });
        });
        return join;
    }

    // IMPLEMENT: Future proofing -> currently not supported
    #crossJoin(schema, table1Name, table2Name) {
        return this.#innerJoin(schema, table1Name, table2Name, () => true);
    }

    // example of sql where condition: where owners.id = 3;
    // example of js where condition: (row) => row["col"] === 3 ;
    #where(tableExpression, condition) {
        return tableExpression.filter((row) => condition(row));
    }

    #select(tableExpression, ...columnsToKeep) {
        let select = [];
        tableExpression.forEach((row) => {
            select.push(Object.fromEntries(Object.entries(row).filter(([key, value]) => columnsToKeep.includes(key))));
        });
        return select;
    }
}

export default SqlParser.instance;