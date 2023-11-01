import { Request, Response } from "express";
import fs, { readdirSync, unlinkSync } from "fs";
import stream, { Stream } from "stream";
import crypto from "crypto";
import utils from "util";
import Action from "../index";
import { log } from "logie";
import DatabaseController from "./DatabaseController";


const CWD = process.cwd();
const readFile = utils.promisify(fs.readFile);

export default abstract class ServerController {

  static async create(req: Request, res: Response) {

    const collectionName_raw = req.params.collectionName;

    const collectionName = ServerController.pluralize(collectionName_raw);

    const models = ServerController.getLocalBasedModels();

    const NEW_MODEL = !(models.collectionName);

    if (NEW_MODEL) {

      await DatabaseController.createTable(collectionName);

      models[collectionName] = true;

      ServerController.addLocalBasedModel(models );

    }

    const NO_REQUEST_BODY = Object.keys(req.body).length === 0;

    if (NO_REQUEST_BODY) {
      return ServerController.respond( res, "The request body appears to be empty", "error" );
    }

    const document = {
      ...req.body,
    };

   const data = await DatabaseController.insertIntoTable( collectionName, JSON.stringify( document) );

    ServerController.respond( res, data , "success", 201 )

  }

  static async getAll(req: Request, res: Response) {

    const collectionName_raw = req.params.collectionName;

    const order = req.query?.order ?? "a";

    const limit = parseInt(req.query?.limit as string);

    const offset = parseInt( req.query?.offset as string );

    const collectionName = ServerController.pluralize(collectionName_raw);

    const rows = await DatabaseController.selectFromTable(collectionName, limit, offset );

    ServerController.respond(res, rows , "success" );
  }

  static async getOne(req: Request, res: Response) {

    const { collectionName: collectionName_raw, id } = req.params;

    const collectionName = ServerController.pluralize(collectionName_raw);

    const main_file = ServerController.getFile(id, collectionName);

    if (!main_file) return ServerController.respond( res, `document not found`, "error", 404 );

    try {
      const doc_json = await readFile(
        `${CWD}/db/collections/${collectionName}/${main_file}`
      );

      const doc = JSON.parse(doc_json.toString());

      ServerController.respond(res, doc, "success");

    } catch (err: any) {
      if (err.code === "ENOENT") {
        ServerController.respond( res, `document not found`, "error", 404 );
      }
    }
  }

  static async update(req: Request, res: Response) {
    const { collectionName: collectionName_raw, id } = req.params;

    const collectionName = ServerController.pluralize(collectionName_raw);

    const { update } = req.body;

    if (update.hasOwnProperty("_id"))
      return ServerController.respond(res, "The `_id` property for documents are immutable as it exists as a primary key. ", "error", 403);
      
    if (update.hasOwnProperty("timestamps"))
      return ServerController.respond(res, "The `timestamps` property for documents are immutable. ", "error", 403);

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

      ServerController.respond( res, new_doc, "success" )
      
    } catch (err: any) {
      if (err.code === "ENOENT") {
        ServerController.respond( res, err, "error", 404 )
      }
    }
  }

  static async delete(req: Request, res: Response) {
    const { collectionName: collectionName_raw, id } = req.params;

    const collectionName = ServerController.pluralize(collectionName_raw);

    const main_file = ServerController.getFile(id, collectionName);

    if (!main_file) return ServerController.respond(res, "Document not found", "error", 404 );
  
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
        return ServerController.respond(res, "Document not found", "error", 404 );
      }

      return console.log(err);
    }

    ServerController.respond( res, "Document deleted successfully", "success" )
  }

  static pluralize(model: string) {
    return model.charAt(model.length - 1) !== "s" ? `${model}s` : model;
  }

  static async query(req: Request, res: Response) {
    
    const filter = req.query;

    const { collectionName: collectionName_raw } = req.params;

    const collectionName = ServerController.pluralize(collectionName_raw);

    const limit = parseInt(req.query?.limit as string);

    const offset = parseInt( req.query?.offset as string );

    const filtered_result =await DatabaseController.selectByFilter( collectionName, filter, limit, offset );

    ServerController.respond( res, filtered_result, "success" );

  }

  static getFile(file_id: string, collectionName: string) {
    return readdirSync(`${CWD}/db/collections/${collectionName}/`).find(
      (file) => file.split(".")[0].split("_")[1] === file_id
    );
  }

  static getLocalBasedModels(){

    const models = fs.readFileSync(`${CWD}/db/models.json`,{ encoding: "utf-8" });

    return JSON.parse( models );

  }

  static addLocalBasedModel( content: any ){

    fs.writeFileSync(`${CWD}/db/models.json`, JSON.stringify( content ) );

  }

  static respond(
    res: Response,
    payload: any,
    status: "success" | "error",
    code?: number
  ) {
    if (status === "error") {
      return res.status(code as number ?? 400 ).json({
        status,
        response: false,
        reason: payload,
      });
    }

    res.status( code as number ?? 200 ).json({
      status,
      response: payload
    })
  }
}


