"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Data = void 0;
const fs_1 = __importDefault(require("fs"));
class Data {
    constructor(rq, rs, hd) {
        this.req = rq;
        this.res = rs;
        this.header = hd;
    }
    get() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.header.id) {
                return new Promise((resolve, reject) => {
                    const files = fs_1.default.readdirSync(`collections/${this.header.collection_name}`);
                    let all_data = [];
                    if (files.length != 0) {
                        files.forEach((each) => {
                            const data = JSON.parse(fs_1.default.readFileSync(`collections/${this.header.collection_name}/${each}`, 'utf-8'));
                            all_data.push(data);
                        });
                        resolve(all_data);
                    }
                    else {
                        reject('The collection directory is empty');
                    }
                });
            }
            else {
                return new Promise((resolve, reject) => {
                    const file_data = JSON.parse(fs_1.default.readFileSync(`collections/${this.header.collection_name}/${this.header.id}.json`, 'utf-8'));
                    if (file_data) {
                        resolve(file_data);
                    }
                    else {
                        reject("The file with the above id doesn't exist");
                    }
                });
            }
        });
    }
    post() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                fs_1.default.writeFile(`collections/${this.header.collection_name}/${this.header.id}.json`, JSON.stringify(this.header.data), (err) => {
                    if (!err) {
                        resolve(this.header.data);
                    }
                    else {
                        reject(err);
                    }
                });
            });
        });
    }
    update() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                fs_1.default.unlinkSync(`collections/${this.header.collection_name}/${this.header.id}.json`);
                fs_1.default.writeFile(`collections/${this.header.collection_name}/${this.header.id}.json`, JSON.stringify(this.header.data), (err) => {
                    if (!err) {
                        resolve(this.header.data);
                    }
                    else {
                        reject(err);
                    }
                });
            });
        });
    }
    createCollectionAndPost() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                fs_1.default.mkdirSync(`collections/${this.header.collection_name}`);
                fs_1.default.writeFile(`collections/${this.header.collection_name}/${this.header.id}.json`, JSON.stringify(this.header.data), (err) => {
                    if (!err) {
                        reject(this.header.data);
                    }
                    else {
                        reject(err);
                    }
                });
            });
        });
    }
    findByKey(key) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                const files = fs_1.default.readdirSync(`collections/${this.header.collection_name}`);
                let all_data = [];
                let main_data = [];
                if (files.length != 0) {
                    files.forEach((each, index) => {
                        const data = JSON.parse(fs_1.default.readFileSync(`collections/${this.header.collection_name}/${each}`, 'utf-8'));
                        all_data.push([Object.keys(data), Object.values(data), index]);
                        const data_key = Object.keys(key)[0];
                        const data_value = Object.values(key)[0];
                        if (Object.keys(data).includes(data_key) && Object.values(data).includes(data_value) && Object.keys(data).indexOf(data_key) == Object.values(data).indexOf(data_value)) {
                            main_data.push(data);
                        }
                    });
                    resolve(main_data);
                }
                else {
                    reject('The collection directory is empty');
                }
            });
        });
    }
}
exports.Data = Data;
