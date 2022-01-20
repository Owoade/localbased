import { rejects } from 'assert';
import fs, { mkdir } from 'fs';

interface dataModel {
    get(): any,
    post(): any,
    update(): any,
    createCollectionAndPost():any
    findByKey(key:object):any
}
interface headerModel {
    collection_name: string,
    data?: object,
    id?: string | number

}
export class Data implements dataModel {
    req: object
    res: object
    header: headerModel
    constructor(rq: any, rs: any, hd: headerModel) {
        this.req = rq;
        this.res = rs;
        this.header = hd
    }
    async get(){
        if(!this.header.id){
            return new Promise((resolve:Function,reject:Function)=>{
               const files: String[] | [] = fs.readdirSync(`collections/${this.header.collection_name}`);
               let all_data:any=[]
               if(files.length != 0 ){
                   files.forEach((each)=>{
                    const data= JSON.parse(fs.readFileSync(`collections/${this.header.collection_name}/${each}`,'utf-8'));
                    all_data.push(data)
                   })
                   resolve(all_data)
               }else{
                   reject('The collection directory is empty');
               }
            })
        }else{
            return new Promise((resolve:Function,reject:Function)=>{
                const file_data: object =JSON.parse(fs.readFileSync(`collections/${this.header.collection_name}/${this.header.id}.json`,'utf-8'));
                if(file_data){
                    resolve(file_data)
                }else{
                    reject("The file with the above id doesn't exist")
                }  
             })
        }
    }
    async post(){
        return new Promise((resolve:Function,reject:Function)=>{
            fs.writeFile(`collections/${this.header.collection_name}/${this.header.id}.json`,JSON.stringify(this.header.data), (err) => {
                if (!err) {
                    resolve(this.header.data)
                } else {
                   reject(err)
                }
            });
        })
    }
    async update(){
        return new Promise((resolve: Function, reject: Function) => {
            fs.unlinkSync(`collections/${this.header.collection_name}/${this.header.id}.json`);
            fs.writeFile(`collections/${this.header.collection_name}/${this.header.id}.json`, JSON.stringify(this.header.data), (err) => {
                if (!err) {
                    resolve(this.header.data)
                } else {
                   reject(err)
                }
            });
            
        })
    }
    async createCollectionAndPost() {
        return new Promise((resolve: Function, reject: Function) => {
            fs.mkdirSync(`collections/${this.header.collection_name}`)
            fs.writeFile(`collections/${this.header.collection_name}/${this.header.id}.json`, JSON.stringify(this.header.data), (err) => {
                if (!err) {
                    reject(this.header.data)
                } else {
                   reject(err)
                }
            });
        })
    }

    async findByKey(key:object) {
        return new Promise((resolve,reject)=>{
            const files: String[] | [] = fs.readdirSync(`collections/${this.header.collection_name}`);
            let all_data:any=[]
            let main_data:any = []
            if(files.length != 0 ){
                files.forEach((each,index)=>{
                 const data= JSON.parse(fs.readFileSync(`collections/${this.header.collection_name}/${each}`,'utf-8'));
                 all_data.push([Object.keys(data),Object.values(data),index]);
                 const data_key = Object.keys(key)[0]
                 const data_value = Object.values(key)[0]
                 if(Object.keys(data).includes(data_key) && Object.values(data).includes(data_value) && Object.keys(data).indexOf(data_key) == Object.values(data).indexOf(data_value)){
                     main_data.push(data);
                 }
                 
                })
                resolve(main_data)
            }else{
                reject('The collection directory is empty');
            }
        })
    }

}

