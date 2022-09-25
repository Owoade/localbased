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
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const dataClass_js_1 = require("./dataClass.js");
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 2022;
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use((0, cors_1.default)({
    origin: "*"
}));
app.get('/', (req, res) => {
    res.send('<h1>hello<h1>');
});
app.get('/get/:collection', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const collection = req.params.collection;
    const newData = new dataClass_js_1.Data(req, res, { collection_name: collection });
    newData.get().then(data => res.json(data)).catch(err => res.send(err));
}));
app.get('/get/:collection/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const collection = req.params.collection;
    const id = req.params.id;
    const newData = new dataClass_js_1.Data(req, res, { collection_name: collection, id: id });
    newData.get().then(data => res.json(data)).catch(err => res.send(err));
}));
app.post('/create/:collection', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const collection = req.params.collection;
    const id = Date.now();
    const data = req.body.data;
    const files = fs_1.default.readdirSync("collections");
    console.log(data);
    const parsed_data = Object.assign(Object.assign({}, data), { id });
    if (!files.includes(`${collection}`)) {
        const newData = new dataClass_js_1.Data(req, res, { collection_name: collection, data: parsed_data, id });
        newData.createCollectionAndPost().then(data => res.json(parsed_data)).catch(err => res.send(err));
    }
    else {
        const newData = new dataClass_js_1.Data(req, res, { collection_name: collection, data: parsed_data, id: id });
        newData.post().then((data) => { res.json(parsed_data); }).catch((err) => { res.send(err); });
    }
}));
app.post('/update/:collection/:id', (req, res) => {
    const collection = req.params.collection;
    const id = req.params.id;
    // const data:string = req.params.data;
    const data = req.body.data;
    const prev_data = JSON.parse(fs_1.default.readFileSync(`collections/${collection}/${id}.json`, 'utf-8'));
    const new_data = Object.assign(Object.assign({}, prev_data), data);
    const newData = new dataClass_js_1.Data(req, res, { collection_name: collection, data: new_data, id: id });
    newData.update().then(data => res.json(new_data)).catch(err => res.send(err));
});
app.post('/get-with-key/:collection', (req, res) => {
    const collection = req.params.collection;
    const data = req.body.data;
    console.log(data);
    const newData = new dataClass_js_1.Data(req, res, { collection_name: collection });
    newData.findByKey(data).then(data => res.json(data)).catch(err => res.send(err));
});
// app.get('get/:collection/:id',())
app.listen(PORT, () => console.log('server running'));
