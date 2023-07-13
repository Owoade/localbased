import express, { Errback, Request, Response } from "express";
import prettier from "prettier";
import fs, { readFileSync } from "fs";
import crypto from "crypto";
import stream, { Stream } from "stream";
import utils from "util";
import { readFile } from "fs/promises";
import ServerController from "./utils/ServerControllers";
import { log } from "logie";
import open from "open";
import path from "path";
import cors from "cors"
const CWD = process.cwd();

const localbase_config = { localbase: { indexes: [] } };

const config_path = `${CWD}/package.json`;

export default abstract class Action {

  static async init() {
    const NO_DB_DIR = !fs.existsSync(`${CWD}/db`);

    if (NO_DB_DIR) {
      fs.mkdirSync(`${CWD}/db`);
      fs.mkdirSync(`${CWD}/db/indexes`);
      fs.mkdirSync(`${CWD}/db/collections`);
    }

  }

  static async startServer(opts: any) {
    const app = express();

    let PORT = opts?.port ?? 2048;

    app.use(express.static(path.join(__dirname,'public')))

    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use(cors({
      origin: "*"
    }))

    app.get("/", (req: Request, res: Response) => {
      console.log("new request");
      res.sendFile("public/index.html", { root: __dirname} )
    });

    app.post("/:collectionName/create", ServerController.create);

    app.get("/:collectionName/get/all", ServerController.getAll);

    app.get("/:collectionName/get/single/:id", ServerController.getOne);

    app.patch("/:collectionName/update/:id", ServerController.update);

    app.delete("/:collectionName/delete/:id", ServerController.delete);

    function listen(port: number){
      // console.log(PORT)
      app.listen(port, () => {
        log(
          `🚀🚀 server running on port ${port}`,
          "INFO"
        );
  
        open(`http://localhost:${port}`);
      })
      .once("error",(e:any)=>{

        if(e.code === "EADDRINUSE"){

          PORT = port + 2

          log(`port ${port} already in use`, "WARN")
          
          listen(port + 2)
          
        }

      })
    }


    listen(PORT)

   
  }

  static async generateConfig() {
    let config_buffer: Buffer;

    let config: {};

    try {
      config_buffer = await readFile(config_path);

      config = JSON.parse(config_buffer.toString());

      const new_config = { ...config, ...localbase_config };

      fs.writeFileSync(
        config_path,
        Action.formatFile(JSON.stringify(new_config))
      );
    } catch (err: any) {
      if (err.code === "ENOENT") {
        console.log("Config file not found, generating config file.... ");

        fs.writeFileSync(
          config_path,
          Action.formatFile(JSON.stringify(localbase_config))
        );
      }
    }
  }

  static async generateMultipleFiles(files: File[]) {
    for (const file of files) {
      fs.writeFile(file.path, file.content, (err: any) => {
        console.log(`[create] ${file.path}`);
      });
    }
  }

  static async generateIndex(indexes: any, opts: any) {
    const appendIndex = opts.append;

    const index_arr = indexes.split("-");

    const NO_CONFIG_FILE = !fs.readdirSync(CWD).includes("package.json");

    if (NO_CONFIG_FILE) await Action.generateConfig();

    const config_buffer = await readFile(config_path);

    const config = JSON.parse(config_buffer.toString());

    const new_config = {
      ...config,
      localbase: {
        ...config.localbase,
        indexes: appendIndex
          ? index_arr.concat(config.localbase?.indexes)
          : index_arr,
      },
    };

    fs.writeFile(
      config_path,
      Action.formatFile(JSON.stringify(new_config)),
      (err: any) => {
        if (err)
          return console.log("Error occured while generating config file");

        return console.log("Indexes created in package.json");
      }
    );

    const files_to_be_genertated = index_arr.map((_: string) => ({
      path: `${CWD}/db/indexes/${_}.json`,
      content: `{  }`,
    })) as File[];

    await Action.generateMultipleFiles(files_to_be_genertated);
  }

  static formatFile(content: string) {
    return prettier.format(content, { semi: false, parser: "json" });
  }
}

interface File {
  path: string;
  content: string | Buffer;
}
