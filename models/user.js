const userStore=[];


class User{
    constructor(name,email,password){
        this.name=name;
        this.email=email;
        this.password=password;
    }

    save(){
        return userStore.push(this);
    }
}

module.exports={
    userStore,
    User
}