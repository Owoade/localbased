# localbased
A JSON based DBMS for local use (a firebase inspired project🙂) 

## Installation
`npm i -g logie`

Start the server
`localbased start --port [port] default:2048`

### Endpoints
**Note** `collectionName` is just like a table's name in SQL and is created once the first document is create
 - ```/:collectionName/create``` method: **POST**; payload: **check below**; This creates a document in the specified collection
```
  request.body: {
       ...data
    }
 ```
