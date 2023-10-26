import util from "util";

export default abstract class DatabaseController {

  static async createTable(name: string) {

    const localbased = (await DatabaseController.lb()).default;

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

    return lb

  }

  static async insertIntoTable( name: string, data: string ){

    const localbase = (await DatabaseController.lb()).default

    localbase.run(
        `INSERT INTO '${name}' (data) VALUES (?) RETURNING *;`,
        [data],
        function (error) {
          if (error) {
            Promise.reject(error)
          }

          Promise.resolve({id: this.lastID, ...(JSON.parse(data)) });

        }
      );
  }

  static async selectFromTable(name: string, limit:number=30, offset: number = 0 ){

    const localbase = (await DatabaseController.lb()).default;

    const query = `SELECT * FROM "${name}" LIMIT ${limit} OFFSET ${offset}`;

    return new Promise((res, rej) => {

      localbase.all(query, (err, rows) => {

        if (err) rej(err);

        res(rows.map( (row: any) => ( { id: row.id, ...(JSON.parse(row.data)),createdAt: row.createdAt, updatedAt: row.createdAt })));

      });

    });



  }




}