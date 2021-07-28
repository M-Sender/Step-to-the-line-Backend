const crypto = require('crypto');

class Host{
    static generateSessionId(LiveSessionData,DBConnect){
        const sessId = crypto.randomBytes(3).toString('hex').toUpperCase();
        var test = -1;
        var dictUse = {count:0};
        var queryText = "SELECT COUNT(sessionID) FROM session_info WHERE sessionID = \'"+sessId.toString()+"\'";
        DBConnect.query(queryText, function (err, result) {
          if (err) throw err;
          var key = Object.keys(result);
          dictUse.count = key[0];});
        if(dictUse.count==0 && !(sessId in LiveSessionData.sessions)){
          return sessId;
        }
        else{
          return generateSessionId(LiveSessionData,DBConnect);
        }
    }
    static createSession(socket,Master,data){
        var sessionID = Host.generateSessionId(Master.LiveSessionData,Master.DBConnect);
        socket.join(sessionID);
        console.log(`Session ${sessionID} created for host ${socket.id}`);
        Master.LiveSessionData.addSession(sessionID,socket.id,0,0);
        Master.QuestionData.addSession(sessionID, data, Master.DBConnect);
        Master.io.to(sessionID).emit('send-session-id',({sessionID:sessionID,token:Master.encrypt(sessionID)}));
        Master.UserData.addSession(sessionID);
    }
    static rejoin(socket,Master,sessionID){
        if(Master.LiveSessionData.validateSession(sessionID)){
            socket.join(sessionID);
            Master.LiveSessionData.setHost(sessionID,socket.id);}
        else{
              //let host know session does not exist
              Master.io.to(socket.id).emit('session-DNE');
            }
    }
    static start_questions(Master,sessionID){
      Master.LiveSessionData.setUnJoinable(sessionID);
      if(Master.QuestionData.sessions[sessionID].useable){
      var newQ = Master.QuestionData.nextQuestion(sessionID);
      Master.io.to(sessionID).emit('recieve_question',(newQ));
      }
      else{
        //'host-transfer-analytics'
      }
    }
    static nextQuestion(Master,sessionID){
        //1. need to obtain question with ans, put in to session holder.
      //2. need to clean ans after 1 is done
      Master.LiveSessionData.resetNumAns(sessionID);
      var newQ = Master.QuestionData.nextQuestion(sessionID);
      if(newQ=="OVER"){
        // enter everything into databasee
        Master.AnalyticData.addSession(sessionID,Master.LiveSessionData.sessions[sessionID],Master.QuestionData.sessions[sessionID],Master.UserData.sessions[sessionID],Master.DBConnect);      
        Master.io.to(Master.LiveSessionData.sessions[sessionID].hostID).emit('host-transfer-analytics');
        Master.io.to(sessionID).emit('end-user');
      }
      else{
      Master.io.to(Master.LiveSessionData.sessions[sessionID].hostID).emit('update-answered',0);
      // send to host and user
      Master.io.to(sessionID).emit('recieve_question',(newQ));}
    }
    static startAnalytics(socket,Master,sessionID){
        Master.io.to(socket.id).emit('send_analytics',Master.AnalyticData.sessions[sessionID]);
    }
}
module.exports = {Host};