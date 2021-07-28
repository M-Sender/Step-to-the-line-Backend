const mathpkg = require('simple-statistics');

class analyticModels {
    constructor(){
        this.sessions = {};
    }



    getSessionIndex(){

    }
    compareIndex(){
        
    }
    organizeData(questionData,userData){
        var scores = [];
        var graphParse = []; //Graphing Data //DONE
        var zipTable = {}; //Tracks scores associated with zipcode

        for(let userName in questionData.userScore){
            graphParse.push({"name":userName, "value": questionData.userScore[userName]}); 
            scores.push(questionData.userScore[userName]);
            var persZip = userData.zipcode[userName];
            try {
                zipTable[persZip].push(questionData.userScore[userName]); //DNE --> catch
            } catch (e) {
                zipTable[persZip] = [questionData.userScore[userName]];
            }
            }
        var sessionAvg = mathpkg.mean(scores)
        var sessiondStd = mathpkg.standardDeviation(scores)
        var sessionQuartiles = [mathpkg.quantile(scores,0.25),mathpkg.quantile(scores,0.50),mathpkg.quantile(scores,0.75),mathpkg.quantile(scores,1.00)]
        return {scores:scores,graphParse:graphParse, zipTable:zipTable,sessionAvg:sessionAvg,sessiondStd:sessiondStd,sessionQuartiles:sessionQuartiles}
    }
    static getZipPercentiles_and_Diff(organizeOBJ,zipID,zipScores){
        var scores = organizeOBJ.scores;
        var percentiles = [];
        var percentDiff = [];
        for(var userScore of zipScores){
            percentiles.push(mathpkg.quantileRank(scores,userScore));
            var diff = (userScore - organizeOBJ.sessionAvg)/organizeOBJ.sessionAvg;
            percentDiff.push(diff);
        }
        return {percentiles:percentiles,percent_Diff: percentDiff};
    }
    insertDB_zipcodes(organizeOBJ,DBConnect){
        var zipAverages = {};
        var zipTable = organizeOBJ.zipTable;
        var zipPercentiles = {};
        var zipDiff = {};
        var zipPercentileAvg = {};
        var zipPercentDiff  = {};
        for(let zipID in zipTable){
            var sql = `SELECT * FROM zipcodes WHERE zipcode = '${zipID}';`;
                DBConnect.query(sql, function (err, result) {
                    if (err) console.log(err);
                    if(!(result.length==0)){
                        var curValues = Object.values(JSON.parse(JSON.stringify(result)));
                        var newScore = curValues[0].totalScore + mathpkg.sum(zipTable[zipID]); //track score and num users for avgs
                        zipAverages[zipID] = newScore/(curValues[0].numScores+zipTable[zipID].length);
                        var zipObj = analyticModels.getZipPercentiles_and_Diff(organizeOBJ,zipID,zipTable[zipID]);

                        zipPercentiles[zipID] = zipObj.percentiles;
                        zipDiff[zipID] = zipObj.percent_Diff;

                        var allPercentiles = (curValues[0].percentiles).concat(zipObj.percentiles);
                        var allDiff = (curValues[0].percent_Diff_Avg).concat(zipObj.percent_Diff);
                        zipPercentileAvg[zipID] = mathpkg.sum(allPercentiles)/allPercentiles.length;
                        zipPercentDiff[zipID] = mathpkg.sum(allDiff)/allDiff.length;

                        var oldScores = curValues[0].allScores;
                        var allScores = JSON.stringify(oldScores.concat(zipTable[zipID]));

                        var newSQL = `UPDATE zipcodes
                        SET totalScore = '${newScore}', numScores = '${curValues[0].numScores+zipTable[zipID].length}', allScores = '${allScores}', percentiles = '${JSON.stringify(allPercentiles)}', percent_Diff_Avg ='${JSON.stringify(allDiff)}'
                        WHERE zipcode = '${curValues[0].zipcode}'`;
                        DBConnect.query(newSQL, function (err, result) {
                            if (err) console.log(err);
                    });
                }
                else{
                    zipAverages[zipID] = mathpkg.sum(zipTable[zipID])/zipTable[zipID].length;
                    
                    var zipObj = analyticModels.getZipPercentiles_and_Diff(organizeOBJ,zipID,zipTable[zipID]);
                        zipPercentiles[zipID] = zipObj.percentiles;
                        zipDiff[zipID] = zipObj.percent_Diff;
                        zipPercentileAvg[zipID] = mathpkg.sum(zipObj.percentiles)/zipObj.percentiles.length;
                        zipPercentDiff[zipID] = mathpkg.sum(zipObj.percent_Diff)/zipObj.percent_Diff.length;
                    var newSQL = `INSERT INTO zipcodes 
                    (zipcode,equ_Index,totalScore,numScores,allScores,percentiles,percent_Diff_Avg) 
                    VALUES ('${zipID}','5','${mathpkg.sum(zipTable[zipID])}','${zipTable[zipID].length}','${JSON.stringify(zipTable[zipID])}','${JSON.stringify(zipPercentiles[zipID])}','${JSON.stringify(zipDiff[zipID])}')`;

                    DBConnect.query(newSQL, function (err, result) {
                        if (err) console.log(err);
                    });

                }
                });
        }
        return {zipAvgs:zipAverages,zipPercentileAvg:zipPercentileAvg,zipPercentDiff:zipPercentDiff}
    
    }
    insertDB_session_info(liveSession,questionData,userData,organizeOBJ,DBConnect,sessionID){
        var hostID = JSON.stringify(liveSession.hostID);
        var participants = liveSession.participants;
        var questions = JSON.stringify(questionData.questions);
        var answers = JSON.stringify(questionData.qAns);
        var males = userData.Male;
        var females = userData.Female;
        var others = userData.Other;
        var zipcode = JSON.stringify(userData.zipcode);
        var zipcodeBorn = JSON.stringify(userData.zipcodeborn);
        var sessionAvg = organizeOBJ.sessionAvg;
        var sessionQuartiles = JSON.stringify(organizeOBJ.sessionQuartiles);
        var sql = `INSERT INTO session_info 
        (sessionID,hostID,questionsAsked,amount_Users,user_Answers,males,females,others,zipcode,zipcodeBorn,AvgScore,quartiles) 
        VALUES ('${sessionID}','${hostID}','${questions}','${participants}','${answers}','${males}','${females}','${others}','${zipcode}','${zipcodeBorn}','${sessionAvg}','${sessionQuartiles}')`;
        DBConnect.query(sql, function (err, result) {
            //if (err) throw err;
            if (err) console.log(err);
            console.log("Entry inserted");
        });
    }
    addSession(sessionID,liveSession,questionData,userData,DBConnect) {
        
        var organizeOBJ = this.organizeData(questionData,userData);

        this.insertDB_session_info(liveSession,questionData,userData,organizeOBJ,DBConnect,sessionID);

        var zipAnalysis = this.insertDB_zipcodes(organizeOBJ,DBConnect);

        var scores = organizeOBJ.scores;
        var graphParse = organizeOBJ.graphParse;
        var zipTable = organizeOBJ.zipTable;
        var sessionAvg = organizeOBJ.sessionAvg;
        var sessiondStd = organizeOBJ.sessiondStd;
        var sessionQuartiles = organizeOBJ.sessionQuartiles;

        var zipAvgs = zipAnalysis.zipAvgs;
        var zipPercentileAvg = zipAnalysis.zipPercentileAvg;
        var zipPercentDiff = zipAnalysis.zipPercentDiff;
        this.sessions[sessionID] = {graph_data : graphParse,
                                    avg:sessionAvg , 
                                    std: sessiondStd , 
                                    quartiles: sessionQuartiles, 
                                    scores : scores, 
                                    zipAvgs : zipAvgs,
                                    zipPercentileAvg:zipPercentileAvg,
                                    zipPercentDiff:zipPercentDiff
                                    };

    }

    deleteSession(sessionId){
        delete this.sessions[sessionId];
    }
        


    

}

module.exports = {analyticModels};