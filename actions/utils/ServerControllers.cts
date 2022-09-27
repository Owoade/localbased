import { Request, Response } from "express";
import fs from "fs";
import stream, { Stream } from "stream";
import crypto from "crypto";
import utils from "util";
import Action from "../index.cjs";

const CWD = process.cwd();
const readFile = utils.promisify(fs.readFile);

export default abstract class ServerController {

  static async create(req: Request, res: Response) {
    const collectionName = req.params.collectionName;

    // cases
    const NO_COLLECTION_DIR = !fs.existsSync(
      `${CWD}/db/collections/${collectionName}`
    );

    console.log(NO_COLLECTION_DIR);

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

    fs.writeFile(`${dirName}/${documentId}.json`, "{}", (err) => {
      if (err) console.log(err);
      fileStream = fs.createWriteStream(`${dirName}/${documentId}.json`, {
        encoding: "utf-8",
        flags: "w",
      });

      requestStream.pipe(fileStream);

      requestStream.push( Action.formatFile( JSON.stringify( document ) ) );

      res.json(document);
    });
  }

  static async getAll(req: Request, res: Response) {
    const collectionName = req.params.collectionName;
    const documents = fs.readdirSync(`${CWD}/db/collections/${collectionName}`);
    let all_docs: {}[] = [];

    if (documents.length === 0)
      return res.send(`Collection '${collectionName}' doesn't exist`);

    documents.forEach((doc) => {
      console.log(doc);
      const data = JSON.parse(
        fs.readFileSync(
          `${CWD}/db/collections/${collectionName}/${doc}`,
          "utf-8"
        )
      );
      all_docs.push(data);
    });

    res.json({ collectionName, data: all_docs });
  }

  static async getOne(req: Request, res: Response) {
    const { collectionName, id } = req.params;

    try {
      const doc_json = await readFile(`${CWD}/db/${collectionName}/${id}.json`);

      const doc = JSON.parse(doc_json.toString());

      res.json(doc);
    } catch (err: any) {
      if (err.code === "ENOENT") {
        res.status(200).send(`document not found`);
      }
    }
  }

  static async update(req: Request, res: Response) {
    const { collectionName, id } = req.params;

    const q = req.query;

    console.log(q);

    const { update } = req.body;

    try {
      const filePath = `${CWD}/db/collections/${collectionName}/${id}.json`;

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
        read() {},
      });

      updatedDocumentStream.pipe(fileStream);

      updatedDocumentStream.push( Action.formatFile( JSON.stringify( new_doc ) ) );

      res.json(new_doc);
    } catch (err: any) {
      if (err.code === "ENOENT") {
        res.status(404).send(`document not found`);
      }
    }
  }

  static async delete(req: Request, res: Response) {
    const { collectionName, id } = req.params;

    const deleteFile = utils.promisify(fs.unlink);

    await deleteFile(`${CWD}/db/collections/${collectionName}/${id}.json`);

    res.send("document successfully deleted");
  }

  static async query(req: Request, res: Response) {
    const query = req.query;
    const { collectionName } = req.params;

    const config_buffer = await readFile(`${CWD}/package.json`);

    const config = JSON.parse(config_buffer.toString());

    //cases

    const NO_CONFIG = config.localbase === undefined;

    const NO_INDEX = !config.localbase.indexes.includes(collectionName);

    let error_string = ""

    if ( NO_CONFIG ){
      error_string = "Config not found, run `localbase index <...collection-names seprated with - e.g users-comments-likes> `";
      console.error(error_string)
      return res.status(403).send(error_string)
    }

    if ( NO_INDEX ){
      error_string = "Index not found, run `localbase index <...collection-names seprated with - e.g users-comments-likes> --append true `";
      console.error(error_string)
      return res.status(403).send(error_string)
    }

    
  }
}
