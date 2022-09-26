import express, { Request, Response } from 'express'

export default abstract class Action {

    static async startServer( opts:any ){
        const app = express();

        const PORT = opts.port ?? 2048;
        
        app.get('/hello', (req:Request, res:Response)=>{
            console.log('new request')
        })

        app.listen(PORT, ()=> console.log(`server running on port ${PORT}`))
    }
}