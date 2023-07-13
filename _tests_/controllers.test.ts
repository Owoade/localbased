import { Response } from "express";
import { createRequest, createResponse } from "node-mocks-http";
import { faker } from "@faker-js/faker";
import ServerController from "../actions/utils/ServerControllers";
import fs from "fs"


let res: Response;

// beforeEach(() => {
   
// });

res = createResponse();

res!.json = jest.fn();

res!.status = jest.fn();

ServerController.pluralize = jest.fn();

ServerController.respond = jest.fn();

jest.mock("fs");





describe("Action Controllers", ()=>{
    it("should create a document", async ()=>{

        const req_body =  {
            name: faker.name.fullName(),
            email: faker.internet.email(),
            password: faker.internet.password()
        }

        const req = createRequest({
            method: "POST",
            body: req_body,
            params: {
                collectionName: "users"
            }
        })

        jest.fn(fs.existsSync).mockImplementation(()=> true)

        await ServerController.create(req, res)

        // expect(ServerController.pluralize).toHaveBeenCalledWith(req.params.collectionName)

        expect( fs.mkdirSync).toHaveBeenCalled();

    } )
})