class liveSessions {
    constructor () {//have constructor create object for each session, put into dictionary of sessions, hold everything, delete after
        this.sessions = {};
        this.numSessions = 0;
    }
    addSession( sessionID, hostID, participants, numAnswered){//need way to hold questions for session
        this.sessions[sessionID] = {hostID: hostID, participants: participants, numAnswered : numAnswered , joinable : true};
        this.numSessions +=1;
    }
    removeSession(sessionID){
        delete this.sessions[sessionID];
        this.numSessions -=1;
    }
    setHost(sessionID,hostID){
        this.sessions[sessionID].hostID = hostID;
    }
    getParticipants(sessionID){
        return this.sessions[sessionID].participants;
    }
    addParticipant(sessionID){
        this.sessions[sessionID].participants += 1;
    }
    removeParticipant(sessionID){
        this.sessions[sessionID].participants -= 1;
    }
    addAnswer(sessionID){
        this.sessions[sessionID].numAnswered += 1;
    }

    resetNumAns(sessionID){
        this.sessions[sessionID].numAnswered = 0;
    }
    validateSession(sessionID){
        return(sessionID in this.sessions);}
    setUnJoinable(sessionID){
        this.sessions[sessionID].joinable = false;
    }

}
module.exports = {liveSessions};