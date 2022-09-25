import express from 'express';
import fs, { mkdir } from 'fs';
import {Data} from './dataClass.js'
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 2022;

app.use(express.json())
app.use(express.urlencoded({ extended: false}))
app.use(cors({
    origin:"*"
}))

app.get('/', (req, res) => {
    res.send('<h1>hello<h1>')
});
app.get('/get/:collection', async (req,res)=>{
    const collection: string = req.params.collection;
    const newData = new Data(req,res,{collection_name:collection})

    newData.get().then(data => res.json(data)).catch(err => res.send(err))
})
app.get('/get/:collection/:id', async (req,res)=>{
    const collection: string = req.params.collection;
    const id: string = req.params.id;
    const newData = new Data(req,res,{collection_name:collection,id:id})

    newData.get().then(data => res.json(data)).catch(err => res.send(err))
})

app.post('/create/:collection', async (req:any, res:any) => {
    const collection: string = req.params.collection;
    const id = Date.now();
    const data: Object = req.body.data; 
    const files: String[] | [] = fs.readdirSync("collections");
    console.log(data)
    const parsed_data = { ...data, id} 

    if (!files.includes(`${collection}`)) {

        const newData = new Data(req,res,{collection_name:collection,data:parsed_data,id});

        newData.createCollectionAndPost().then(data => res.json(parsed_data)).catch(err => res.send(err))

    } else {

        const newData= new Data(req,res,{collection_name:collection,data:parsed_data,id:id})

        newData.post().then((data)=>{res.json(parsed_data)}).catch((err)=>{ res.send(err)}) 

    }
   
})

app.post('/update/:collection/:id',(req,res)=>{
    const collection: string = req.params.collection;
    const id: string = req.params.id;
    // const data:string = req.params.data;
    const data = req.body.data;
    const prev_data= JSON.parse(fs.readFileSync(`collections/${collection}/${id}.json`,'utf-8'));
    const new_data= {...prev_data,...data}

    const newData = new Data(req,res,{collection_name:collection,data:new_data,id:id});
    newData.update().then(data=>res.json(new_data)).catch(err=>res.send(err));
})
app.post('/get-with-key/:collection',(req,res)=>{
    const collection: string = req.params.collection;
    const data = req.body.data;
    console.log(data)
    
    const newData= new Data(req,res,{collection_name:collection});
    newData.findByKey(data).then(data=>res.json(data)).catch(err=>res.send(err));
})

// app.get('get/:collection/:id',())

app.listen(PORT, () => console.log('server running'))