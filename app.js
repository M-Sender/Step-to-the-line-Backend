//import {config} from './config.js'


//const Dotenv =  require('dotenv-webpack');-------------------
//
/**try{
  const result = require('dotenv').config();
  ('error' in result) ? 1/0 : 1+1;
}
catch{
  //dotenv did not work

}*/
//require('dotenv').config();
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const port = process.env.PORT || 5000;
const index = require("./routes/index");
const app = express();
app.use(index);
const server = http.createServer(app);
const io = socketIo(server); 


//DataBase portion
var mysql = require('mysql2');
var sessionSQL = mysql.createConnection({
  host: 'ckshdphy86qnz0bj.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',//process.env.DB_HOST ,
  user: 'x2esdoz459l5kob3', //process.env.DB_USER,
  password: 'kv87k8p6jzj4h8mk',//process.env.DB_PASS ,
  database: 'gnzd5ehxqqi4dzei'//process.env.DB_NAME
});
sessionSQL.connect(function(err){
  if (err) throw err;
  console.log("Connected to database");
})


const mathpkg = require('simple-statistics');
//util classes
const {Master} = require('./master.js');
const { error } = require('console');

var server_Data = new Master(io,sessionSQL);



function updateQuestion(sessionID){
  var quesObj = questionsHold[sessionID];
  var curQ = quesObj.nextQuestion();
  var newQ = quesObj.questions[curQ];
  io.to(sessionID).emit('question_update',(newQ));
}



  io.on('connection', (socket) => {

    //UNIVERSAL FUNCTIONS
    socket.on('validate_sessionID',function(sessionID) { //all good now, need to verify certain users for session, not only session
      server_Data.validate_Session(socket,sessionID);
    });
    socket.on('validate_Instance',function(data){
      data = {sessionID: data.sessionID,userName: server_Data.decrypt(data.userName)};
      server_Data.validate_Instance(socket,data);
    });


    //USER FUNCTIONS
    socket.on('checkSessionID',function(data){
      server_Data.checkSessionID(socket,data);
    });
    socket.on('submit-user-info',function(data){//add something for verifying whether nickname taken on not.
      server_Data.submit_user_info(socket,data);

    });
    socket.on("user-join-session",(data) => {
      server_Data.add_user_to_session(socket,data);
    });
    socket.on('check-user',function(data){
      server_Data.check_userName(socket,data);
    });
    socket.on('user-answer',(data) => {
      server_Data.submit_user_answer(socket,data);
    });
    socket.on('user_analytics',(data)=>{
      server_Data.obtain_user_result(socket,data);
    });
    //HOST FUNCTIONS
    socket.on('validate_hostKey',(hostKey)=>{
      server_Data.verifyKey(socket,hostKey);
    });
    socket.on("host-create-session",(data) => {
      server_Data.createSession(socket,data);
    });
    socket.on("host-rejoin",(sessionID) =>{
      server_Data.host_rejoin(socket,sessionID);
    });
    socket.on('question_start',(sessionID) =>{
      server_Data.begin_questions(sessionID);
    });
    socket.on('question_update',(sessionID)=> {
      server_Data.nextQuestion(sessionID);
    });

    socket.on('grab_analytics',function(sessionID){
      server_Data.startAnalytics(socket,sessionID);
    });
    socket.on('delete-sessionID',function(sessionID){
      server_Data.deleteSession(socket,sessionID);

    });


});







server.listen(port, () => console.log(`Listening on port ${port}`));
