interface dbInterface{
    getAll(collection_name:string):any,
    post(collection_name:string,data:object):any,
    update(collection_name:string,id:string | number,data:object):any,
    getById(collection_name:string,id:string | number):any,
    getWithKey(collection_name:string,key:object):any
}



class Db implements dbInterface {
   BASE_URL:string='localhost:2022';
   constructor(){
    this.BASE_URL=this.BASE_URL
   }
   async getAll(collection_name: string) {
       return new Promise((res:Function,rej:Function)=>{
          fetch(`http://${this.BASE_URL}/get/${collection_name}/`)
          .then(res=>res.json())
          .then(data=>res(data))
          .catch(err=>rej(err))
       })
   }
   async getById(collection_name: string, id: string | number) {
    return new Promise((res:Function,rej:Function)=>{
        fetch(`http://${this.BASE_URL}/get/${collection_name}/${id}`)
        .then(res=>res.json())
        .then(data=>res(data))
        .catch(err=>rej(err))
     })
   }
   async post(collection_name: string, data: object) {
    return new Promise((res:Function,rej:Function)=>{
        fetch(`http://${this.BASE_URL}/create/${collection_name}`, {
                method: "POST", 
                body: JSON.stringify({
                    data:data
                }),
                headers: {
                    "Content-type": "application/json; charset=UTF-8"
                }
        })
        .then(res=>res.json())
        .then(data=>res(data))
        .catch(err=>rej(err))
     })
   }

   async update(collection_name: string,id: string | number , data: object) {
    return new Promise((res:Function,rej:Function)=>{
        fetch(`http://${this.BASE_URL}/update/${collection_name}/${id}`, {
                method: "POST", 
                body: JSON.stringify({
                    data:data
                }),
                headers: {
                    "Content-type": "application/json; charset=UTF-8"
                }
        })
        .then(res=>res.json())
        .then(data=>res(data))
        .catch(err=>rej(err))
     })
   }
   async getWithKey(collection_name: string, key: object) {
    return new Promise((res:Function,rej:Function)=>{
        fetch(`http://${this.BASE_URL}/get-with-key/${collection_name}`, {
                method: "POST", 
                body: JSON.stringify({
                    data:key
                }),
                headers: {
                    "Content-type": "application/json; charset=UTF-8"
                }
        })
        .then(res=>res.json())
        .then(data=>res(data))
        .catch(err=>rej(err))
    })  
   }


}

