const getDb=require("../util/database").getDb;

class User{
    constructor(name,email,password,resetToken,resetTokenExpiration){
        this.name=name;
        this.email=email;
        this.password=password;
        this.resetToken=resetToken;
        this.resetTokenExpiration=resetTokenExpiration
    }
    
    save(){
        const db=getDb();
        return db.collection("users").insertOne(this);
    }

}

module.exports=User;