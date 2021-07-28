class UserData {
    constructor () {//have constructor create object for each session, put into dictionary of sessions, hold everything, delete after
        this.sessions = {};
    }
    addSession(sessionID){
        this.sessions[sessionID] = {Male:0,Female:0,Other:0,zipcode:{},zipcodeborn:{},userNames:[]};
    }
    enterInfo(sessionID,genderVal,zipcodeVal,zipcodeBornVal,userName){
        if(genderVal=='Male'){
            this.sessions[sessionID].Male += 1 ;
        }
        else if(genderVal=='Female'){
            this.sessions[sessionID].Female += 1 ;
        }
        else{
            this.sessions[sessionID].Other += 1 ;
        }
        this.sessions[sessionID].userNames.push(userName)
        this.sessions[sessionID].zipcode[userName] = (zipcodeVal);
        this.sessions[sessionID].zipcodeborn[userName] = (zipcodeBornVal);
    }
    closeInfoSession(sessionID,sessionSQL,DBConnect){
        //enter
        delete this.sessions[sessionID];
    }

    validateUserJoin(sessionID){
        return(sessionID in this.sessions);}

}

module.exports = {UserData};