/**
 * Server Objects to hold in-session info.
 *   liveSessions:
 */
import { liveSessions } from "./utils/livesessions";
import { QuestionData } from "./utils/questions";
import { UserData } from "./utils/users";
import { analyticModels } from "./utils/analyticModels";

//need to require the other classes
import { Host } from './server_Functions/Host';
import { User } from './server_Functions/User';
import { universal } from './server_Functions/universal';

import Cryptr from 'cryptr';
const prvtKey = '23458gu85469gy680999909809809';
const encfunc = new Cryptr(prvtKey);

class Master{
    constructor(io,DBConnect){
        this.io = io;
        this.LiveSessionData = new liveSessions(); //could set a limit of sessions by throwing to constructor with a lim
        this.QuestionData = new QuestionData();
        this.UserData = new UserData();
        this.AnalyticData = new analyticModels();
        this.DBConnect = DBConnect;
    }
    //USERS______________________________________________________________
    //___________________________________________________________________
    //___________________________________________________________________
    encrypt(data){
        return encfunc.encrypt(data);
    }
    decrypt(data){
        return encfunc.decrypt(data);
    }
    checkSessionID(socket,data){
        User.checkSessionID(socket,this,data);
    }
    submit_user_info(socket,data){
        data = {'sessid':data.sessid,'gender':data.gender,'zip':data.zip,'zipborn':data.zipBorn,'userName': this.decrypt(data.userName)}
        User.submit_user_info(socket,this,data);
    }
    add_user_to_session(socket,data){
        data = {sessionID:data.sessionID,userID: this.decrypt(data.userID)};
        User.join_session(socket,this,data);
    }
    check_userName(socket,data){
        User.check_userName(socket,this,data);

    }
    submit_user_answer(socket,data){
        data = {sessionID:data.sessionID,answer:data.answer,userName: this.decrypt(data.userName)};
        User.add_Answer(socket,this,data);
    }
    obtain_user_result(socket,data){
        data = {sessionID:data.sessionID,userName: this.decrypt(data.userName)};
        User.analytics(socket,this,data);
    }

    //HOST_______________________________________________________________
    //___________________________________________________________________
    //___________________________________________________________________
    createSession(socket,data){
        Host.createSession(socket,this,data);
    }
    host_rejoin(socket,data){
        Host.rejoin(socket,this,data);
    }
    begin_questions(data){
        Host.start_questions(this,data);
    }
    nextQuestion(data){
        Host.nextQuestion(this,data);
    }
    startAnalytics(socket,data){
        Host.startAnalytics(socket,this,data);

    }

    //UNIVERSAL
    deleteSession(socket,sessionID){
        //verify that host is shutting down session;//need to implement
        this.LiveSessionData.removeSession(sessionID);
        this.QuestionData.removeSession(sessionID);
        this.UserData.closeInfoSession(sessionID);
        this.AnalyticData.deleteSession(sessionID);  
        console.log(`${sessionID} ended. All relevant data closed.`);

    }
    validate_Session(socket,sessionID){
        universal.validate_Session(socket,this,sessionID);
    }
    validate_Instance(socket,data){
        if(this.LiveSessionData.validateSession(data.sessionID)){
            if(!(this.UserData.sessions[data.sessionID].userNames.includes(data.userName))){
                this.io.to(socket.id).emit('session_DNE');}
          }
        else{
            this.io.to(socket.id).emit('session_DNE');
        }
    }
    verifyKey(socket,hostKey){
        try{
            var token_ = this.decrypt(hostKey);
        }
        catch(error){
            this.io.to(socket.id).emit('session_DNE');
        }
        if(!(this.LiveSessionData.validateSession(token_))){
            this.io.to(socket.id).emit('session_DNE');
        }
    }



}
export default {Master};