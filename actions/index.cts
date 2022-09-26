import express, { Errback, Request, Response } from "express";
import fs, { readFileSync } from "fs";
import crypto from "crypto";
import stream, { Stream } from "stream";
import utils from "util"
import { readFile } from "fs/promises";

import ServerController from "./utils/ServerControllers.cjs";

const CWD = process.cwd();

export default abstract class Action {
  static async startServer(opts: any) {
    const app = express();

    const PORT = opts.port ?? 2048;

    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));

    app.get("/hello", (req: Request, res: Response) => {
      console.log("new request");
    });

    app.post("/:collectionName/create", ServerController.create);

    app.get('/:collectionName/get/all', ServerController.getAll)

    app.get('/:collectionName/get/single/:id', ServerController.getOne)

    app.patch('/:collectionName/update/:id', ServerController.update)

    app.delete('/:collectionName/delete/:id', ServerController.delete)

    app.listen(PORT, () => console.log(`server running on port ${PORT}`));
  }
}
