import { Request, Response } from "express";
import fs, { readdirSync, unlinkSync } from "fs";
import stream, { Stream } from "stream";
import crypto from "crypto";
import utils from "util";
import Action from "../index.cjs";
import { log } from "logie";


const CWD = process.cwd();
const readFile = utils.promisify(fs.readFile);

export default abstract class ServerController {
  static async create(req: Request, res: Response) {
    const collectionName_raw = req.params.collectionName;

    const collectionName = ServerController.pluralize(collectionName_raw);

    // cases
    const NO_COLLECTION_DIR = !fs.existsSync(
      `${CWD}/db/collections/${collectionName}`
    );

    const documentId = crypto.randomUUID();
    const dirName = `${CWD}/db/collections/${collectionName}`;

    const requestStream = new stream.Readable({
      read() {},
    });

    const document = {
      _id: documentId,
      ...req.body,
      timestamps: {
        createdAt: Date.now(),
      },
    };

    if (NO_COLLECTION_DIR) {
      fs.mkdirSync(`${CWD}/db/collections/${collectionName}`);
    }

    let fileStream = new Stream.Writable({
      write() {},
    });

    fs.writeFile(
      `${dirName}/${document.timestamps.createdAt}_${documentId}.json`,
      "{}",
      (err) => {
        if (err) console.log(err);
        fileStream = fs.createWriteStream(
          `${dirName}/${document.timestamps.createdAt}_${documentId}.json`,
          {
            encoding: "utf-8",
            flags: "w",
          }
        );

        requestStream.on("end", () => fileStream.end());

        requestStream.pipe(fileStream);

        requestStream.push(Action.formatFile(JSON.stringify(document)));

        res.json(document);
      }
    );
  }

  static async getAll(req: Request, res: Response) {
    const collectionName_raw = req.params.collectionName;

    const pagination = parseInt(req.query?.pagination as string) || 1;

    const order = req.query?.order ?? "a";

    const PAGINATION_MULTIPLE = 20;

    const collectionName = ServerController.pluralize(collectionName_raw);

    try {
      const documents = fs.readdirSync(
        `${CWD}/db/collections/${collectionName}`
      );
      let all_docs: {}[] = [];

      if (documents.length === 0) {
        return res.json({ collectionName, data: [] });
      }

      if (order === "d") documents.reverse();

      const HAS_MORE = documents.length >= pagination * PAGINATION_MULTIPLE;

      const SLICE_START_INDEX = (pagination - 1) * PAGINATION_MULTIPLE;

      const SLICE_END_INDEX =
        pagination * PAGINATION_MULTIPLE > documents.length
          ? documents.length
          : pagination * PAGINATION_MULTIPLE;

      const slized_documents = documents.slice(
        SLICE_START_INDEX,
        SLICE_END_INDEX
      );

      const pagination_payload = {
        hasMore: HAS_MORE,
        next: HAS_MORE
          ? `http://${req.headers.host}/${collectionName}/get/all?pagination=${
              pagination + 1
            }&&order=${order}`
          : "null",
      };

      slized_documents.forEach((doc) => {
        if (doc.includes("deleted")) return;

        const data = JSON.parse(
          fs.readFileSync(
            `${CWD}/db/collections/${collectionName}/${doc}`,
            "utf-8"
          )
        );

        all_docs.push(data);
      });

      res.json({ collectionName, data: all_docs, ...pagination_payload });
    } catch (err: any) {
      if (err.code === "ENOENT") {
        return res
          .status(404)
          .json({ collectionName, data: [], hasMore: false, next: null });
      }
      return res.status(400).json(err);
    }
  }

  static async getOne(req: Request, res: Response) {
    const { collectionName: collectionName_raw, id } = req.params;

    const collectionName = ServerController.pluralize(collectionName_raw);

    const main_file = ServerController.getFile(id, collectionName);

    if (!main_file) return res.status(404).send(`document not found`);

    try {
      const doc_json = await readFile(
        `${CWD}/db/collections/${collectionName}/${main_file}`
      );

      const doc = JSON.parse(doc_json.toString());

      res.json(doc);
    } catch (err: any) {
      if (err.code === "ENOENT") {
        res.status(404).send(`document not found`);
      }
    }
  }

  static async update(req: Request, res: Response) {
    const { collectionName: collectionName_raw, id } = req.params;

    const collectionName = ServerController.pluralize(collectionName_raw);

    const { update } = req.body;

    if ( update.hasOwnProperty("_id") )
      return res
        .status(403)
        .send(
          "The `_id` property for documents are immutable as it exists as a primary key. "
        );

    if ( update.hasOwnProperty("_id") ) 
      return res
      .status(403)
      .send(
        "The `timestamps` property for documents are immutable as it exists as a primary key. "
      );

    try {
      const main_file = ServerController.getFile(id, collectionName);

      if (!main_file) return res.status(404).send(`document not found`);


      const filePath = `${CWD}/db/collections/${collectionName}/${main_file}`;

      const doc_json = await readFile(filePath);

      const doc = JSON.parse(doc_json.toString());

      const new_doc = {
        ...doc,
        ...update,
        timestamps: {
          ...doc.timestamps,
          updatedAt: Date.now(),
        },
      };

      const fileStream = fs.createWriteStream(filePath);

      const updatedDocumentStream = new stream.Readable({
        emitClose: true,
        read() {},
      });

      updatedDocumentStream.pipe(fileStream);

      updatedDocumentStream.on("close", () => {
        console.log("read stream ended");
        fileStream.close();
      });

      updatedDocumentStream.push(Action.formatFile(JSON.stringify(new_doc)));

      res.json(new_doc);
    } catch (err: any) {
      if (err.code === "ENOENT") {
        res.status(404).send(`document not found`);
      }
    }
  }

  static async delete(req: Request, res: Response) {
    const { collectionName: collectionName_raw, id } = req.params;

    const collectionName = ServerController.pluralize(collectionName_raw);

    const main_file = ServerController.getFile(id, collectionName);

    if (!main_file) return res.status(404).send(`document not found`);

    const file_path = `${CWD}/db/collections/${collectionName}/${main_file}`;
    const temp_file_path = `${CWD}/db/collections/${collectionName}/deleted-${main_file}`;

    try {
      fs.rename(
        file_path,

        temp_file_path,

        (err: any) => {
          if (err) log(err, "ERROR");
          unlinkSync(temp_file_path);
        }
      );
    } catch (err: any) {
      if (err.code === "ENOENT") {
        return res.status(404).send(`document not found`);
      }

      return res.status(400).json(err);
    }

    res.send("Document deleted succesfully");
  }

  static pluralize(model: string) {
    return model.charAt(model.length - 1) !== "s" ? `${model}s` : model;
  }

  static async query(req: Request, res: Response) {
    const query = req.query;

    const { collectionName: collectionName_raw } = req.params;

    const collectionName = ServerController.pluralize(collectionName_raw);

    const config_buffer = await readFile(`${CWD}/package.json`);

    const config = JSON.parse(config_buffer.toString());

    //cases

    const NO_CONFIG = config.localbase === undefined;

    const NO_INDEX = !config.localbase.indexes.includes(collectionName);

    let error_string = "";

    if (NO_CONFIG) {
      error_string =
        "Config not found, run `localbase index <...collection-names seprated with - e.g users-comments-likes> `";
      console.error(error_string);
      return res.status(403).send(error_string);
    }

    if (NO_INDEX) {
      error_string =
        "Index not found, run `localbase index <...collection-names seprated with - e.g users-comments-likes> --append true `";
      console.error(error_string);
      return res.status(403).send(error_string);
    }
  }

  static getFile(file_id: string, collectionName: string) {
    return readdirSync(`${CWD}/db/collections/${collectionName}/`).find(
      (file) => file.split(".")[0].split("_")[1] === file_id
    );
  }
}
