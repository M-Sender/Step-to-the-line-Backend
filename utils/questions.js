class QuestionData { //test
    constructor () {//have constructor create object for each session, put into dictionary of sessions, hold everything, delete after
        this.sessions = {};
    }
    async getQuestions(sessionID,data,DBConnect){
      var question_array = [];
      let qLimit = 2;
      for(let table in data){
        var taken = [];
          let qLimitFunc = function(table){
             return new Promise((resolve, reject)=>{
             DBConnect.query(`SELECT COUNT(*) FROM ${table}`,(error, resultLimit)=>{
              if(error) throw reject(error);
              return resolve(resultLimit['0']['COUNT(*)']);
             });
          });
      }
      qLimit = await qLimitFunc(table);
    
        for(var q = 0; q<data[table] ; q++){
          var qnum = 0;
          var valid = false;
          while(!valid){
            qnum = Math.floor(Math.random() * (qLimit));
            if(!(taken.includes(qnum))){
              valid = true;
              }
            }
          taken.push(qnum);
          let qInfoFunc = function(table,qnum){
             return new Promise((resolve, reject)=>{
              let queryText = `SELECT question_info,question_val_yes,question_val_no FROM ${table}`;
              //let queryText = `SELECT question_info FROM ${table} WHERE 'num' = ${qnum}`;
    
              DBConnect.query(queryText, function (err, resultq) {
                  if (err) throw reject(err);
                  var tempQuestion = resultq[qnum.toString()]['question_info'];
                  var tempVal_yes = resultq[qnum.toString()]['question_val_yes'];
                  var tempVal_no = resultq[qnum.toString()]['question_val_no'];
                  return resolve({question:tempQuestion,yes:tempVal_yes,no:tempVal_no});
                });//query
          });
      }
      let rand_Question_and_Val = await qInfoFunc(table,qnum);
      //get question Val
      question_array.push(rand_Question_and_Val);
        }}
      this.sessions[sessionID].questions = question_array;
      this.sessions[sessionID].QLim = question_array.length;
      return question_array;
      }

    addSession(sessionID,data, DBConnect){//need way to hold questions for session
      this.sessions[sessionID] = {questions: [], curQ: -1,qAns:{}, QLim: 0 , userScore: {}, currentQ:'Waiting for Host...', useable:true};//(array of q's, curQ,answers) //presort of dict into 
      this.getQuestions( sessionID, data, DBConnect);
    }
    removeSession(sessionID){
        delete this.sessions[sessionID];
    }
    addAnswer(sessionID,userID,ans){
      var val = 0;
      if(ans=='N'){
        val = this.sessions[sessionID].questions[this.sessions[sessionID].curQ].no;
      }
      else{
        val = this.sessions[sessionID].questions[this.sessions[sessionID].curQ].yes;
      }
      try{
        this.sessions[sessionID].qAns[userID].push([ans,val]);
        this.sessions[sessionID].userScore[userID] += val;}
      catch{
        this.sessions[sessionID].qAns[userID] = [[ans,val]];
        this.sessions[sessionID].userScore[userID] = val;
      }
    }
    endRound(sessionID){
      //set cur q to 0.
    }
    nextQuestion(sessionID){
      this.sessions[sessionID].curQ += 1;
        if(this.sessions[sessionID].curQ >= this.sessions[sessionID].QLim){
          return "OVER";
        }
        else{
          this.sessions[sessionID].currentQ = this.sessions[sessionID].questions[this.sessions[sessionID].curQ].question;
        return this.sessions[sessionID].questions[this.sessions[sessionID].curQ].question;}
    }
}


module.exports = {QuestionData};