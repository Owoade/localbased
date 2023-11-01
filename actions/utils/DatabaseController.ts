import util from "util";

export default abstract class DatabaseController {

  static async createTable(name: string) {

    const localbased = (await DatabaseController.lb());

    localbased.exec(
      `CREATE TABLE "${name}" (
            id INTEGER PRIMARY KEY,
            data TEXT,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`,
      (err) => console.error(err)
    );

  }

  static async lb(){

    const lb = await import("../db");

    return lb.default

  }

  static async insertIntoTable( name: string, data: string ){

    const localbase = (await DatabaseController.lb())

    return new Promise(( res, rej)=> {
      localbase.run(
        `INSERT INTO '${name}' (data) VALUES (?) RETURNING *;`,
        [data],
        function (error) {
          if (error) {
            rej(error)
          }

          res({id: this.lastID, ...(JSON.parse(data)) });

        }
      );
    })

  
  }

  static async selectFromTable(name: string, limit:number=30, offset: number = 0 ){

    limit = limit || 30;

    offset = offset || 0;

    const localbase = (await DatabaseController.lb());

    const query = `SELECT * FROM "${name}" LIMIT ${limit} OFFSET ${offset}`;

    return new Promise((res, rej) => {

      localbase.all(query, (err, rows) => {

        if (err) rej(err);

        res(rows.map( (row: any) => ( { id: row.id, ...(JSON.parse(row.data)),createdAt: row.createdAt, updatedAt: row.createdAt })));

      });

    });

  }

  static async selectByFilter( name: string, filter: any, limit:number=30, offset: number = 0 ){

    limit = limit || 30;

    offset = offset || 0;

    const where_filter = DatabaseController.makeDbFilter( filter );

    const query = `SELECT * FROM "${name}" WHERE ${where_filter} LIMIT ${limit} OFFSET ${offset}`;

    const localbase = await DatabaseController.lb();

    return new Promise((res, rej) => {

      localbase.all(query, (err, rows) => {

        if (err) rej(err);

        res(rows?.map( (row: any) => ( { id: row.id, ...(JSON.parse(row.data)),createdAt: row.createdAt, updatedAt: row.createdAt })));

      });

    });



  }

  static makeDbFilter( filter: any ){

    let array = [] as string[];

    if( filter.id  ) return `id=${filter.id}`;

    if( typeof filter !== "object" || Array.isArray( filter ) ) return null;

    for ( let key in filter ){
      console.log( filter[key] )
       array.push(`json_extract(data,' $.${key}') = "${filter[key]}"`)
    }

    return array.join(" AND ");

  }




}