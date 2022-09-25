//  Implement the fronend library


const db = new Db()
db.post('user',{username:"kingsley",password:"forlife"}).then(data=> console.log(data))
db.update('user',1642632815488,{status:"paid"}).then(data=>console.log(data))
db.getAll('post').then(data=>console.log(data))
db.getById('user',1642632815488)
db.getWithKey('post',{id:1642629137373}).then(data=>console.log(data))

