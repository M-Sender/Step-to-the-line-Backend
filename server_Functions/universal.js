class universal{

    static validate_Session(socket,Master,sessionID){
        if(!Master.LiveSessionData.validateSession(sessionID)){
            Master.io.to(socket.id).emit('session_DNE');
          }
    }

}
module.exports = {universal};