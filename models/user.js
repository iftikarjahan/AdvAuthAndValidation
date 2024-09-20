const getDb=require("../util/database").getDb;

class User{
    constructor(name,email,password){
        this.name=name;
        this.email=email;
        this.password=password;
    }
    
    save(){
        const db=getDb();
        return db.collection("users").insertOne(this);
    }

}

module.exports=User;