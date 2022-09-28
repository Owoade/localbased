# localbased
A JSON based DBMS for local use (a firebase inspired project🙂),
Thanks to localbased you get to focus more on the your frontend Implementations


## Installation
`npm i -g localbased`

## Initialization
Start the server
`localbased start --port [port] default:2048`

### Endpoints
 - ```/:collectionName/create``` method: **POST**; payload: **check below**; This creates a document in the specified collection
```
  request.body: {
       ...data
    }
 ```
 **Note** `collectionName` is just like a table's name in SQL and is created once the first document is create
 
 - ```/:collectionName/get/all``` method: **GET**; payload: **no payload**; This returns all the document in the specified `collectionName`
 - ```/:collectionName/get/single/:id``` method: **GET**; payload: **no payload**; This returns the document with the specified `id`
 - ```/:collectionName/get/update``` method: **PATCH**; payload: **check below**; This updates a document with the specified `id` 
 ```
    request.body: {
      update: {
          ...updates
      }
    }
 ```
  - ```/:collectionName/get/update``` method: **DELETE**; payload: **no payload**; This deletes a document with the specified `id` 

...Start Building 🚀🚀
Thank you for using **localbased**

