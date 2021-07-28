const mathpkg = require('simple-statistics');
class User{

    static submit_user_info(socket,Master,data){
        if(Master.LiveSessionData.sessions[data.sessid].joinable){
            Master.UserData.enterInfo(data.sessid,data.gender,data.zip,data.zipborn,data.userName);
            //var encSess = encryptCookie(data.sessid);
            //var encName = encryptCookie(data.userName);
            //var packet = {'userName':encName,'sessid':encSess};
        }//if not joinable send to DNE page or something
        else{
            Master.io.to(socket.id).emit('session_DNE');//or send new page that says session is not joinable
        }

    }

    static join_session(socket,Master,data){
      var sessionID = data.sessionID;
      var userID = data.userID;
      //var sessionID = decryptCookie(sessionIDEnc); put in param SESSIONDIDENC
      if(Master.LiveSessionData.validateSession(sessionID) && (Master.LiveSessionData.sessions[sessionID].joinable || (Master.UserData.sessions[data.sessionID].userNames.includes(userID)))){
        socket.join(sessionID);
        console.log(`${socket.id} has joined session ${sessionID}`);
        Master.LiveSessionData.addParticipant(sessionID);
        Master.io.to(Master.LiveSessionData.sessions[sessionID].hostID).emit('update-participants',Master.LiveSessionData.getParticipants(sessionID));
        Master.io.to(socket.id).emit('recieve_question',Master.QuestionData.sessions[sessionID].currentQ)}
      else{
        Master.io.to(socket.id).emit('Room-DNE'); //must implement on client page(not init).
      }
    }

    static check_userName(socket,Master,data){
        Master.io.to(socket.id).emit('user_validate',([!(Master.UserData.sessions[data.sessionID].userNames.includes(data.userName)),Master.encrypt(data.userName)]));
    }
    static add_Answer(socket,Master,data){
        //var sessionID = decryptCookie(data[0]);
        //var answer = data[1];
        //var name = decryptCookie(data[2]);
        var sessionID = data.sessionID;
        var answer = data.answer;
        var name = data.userName;
        Master.LiveSessionData.addAnswer(sessionID);
        Master.QuestionData.addAnswer(sessionID,name,answer);
        Master.io.to(data[0]).emit('update-answered',(Master.LiveSessionData.sessions[sessionID].numAnswered));
    }
    static analytics(socket,Master,data){
      var score = {};
      var sessionID = data.sessionID;
      var userName = data.userName;
      score['userScore'] = Master.QuestionData.sessions[sessionID].userScore[userName];
      score['userQuart'] = mathpkg.quantileRank(Master.AnalyticData.sessions[sessionID].scores,Master.QuestionData.sessions[sessionID].userScore[userName]); //need user quartile
      score['zipID'] = Master.UserData.sessions[sessionID].zipcode[userName];
      //acess db and get zip
      score['zipAvg'] = Master.AnalyticData.sessions[sessionID].zipAvgs[Master.UserData.sessions[sessionID].zipcode[userName]];
      //score['zipPercentileAvg'] = 
      score['dataOBJ'] = Master.AnalyticData.sessions[sessionID];
      //percentiles
      //grab all scores and use math to have user do stuff// or make table already and request (could be better)
      Master.io.to(socket.id).emit('user_grab_analytics',(score));
    }
    static checkSessionID(socket,Master,sessionID){
      if(Master.LiveSessionData.validateSession(sessionID) && Master.LiveSessionData.sessions[sessionID].joinable){
        Master.io.to(socket.id).emit('checkGood',(sessionID));
      }
      else{
        Master.io.to(socket.id).emit('checkBad');
      }
    }

}
module.exports = {User};