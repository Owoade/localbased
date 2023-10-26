import  sqlite3  from "sqlite3";

const filepath = `${process.cwd()}/db/localbased.db`;

function createDbConnection() {
    
  const _sqlite = sqlite3.verbose();

  const db = new _sqlite.Database(filepath, (error) => {
    if (error) {
      return console.error(error.message);
    }
  });

  return db;

}

const localbased = createDbConnection();

export default localbased;

