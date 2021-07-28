/*var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
let requestURL = 'https://api.census.gov/data/2019/acs/acs1?get=NAME&for=us:1&key=6ef3d839845c6500b67b00a07c30c0d61a224218';
let request = new XMLHttpRequest();
request.open('GET', requestURL);
request.responseType = 'json';
request.send()

request.onload = function() {
    console.log(request);
}
*/
const Cryptr = require('cryptr');
const prvtKey = '23458gu85469gy680999909809809';
const encfunc = new Cryptr(prvtKey);
var testm = encfunc.encrypt('hell0');
console.log(testm);
try {
console.log(encfunc.decrypt('71e276d804efb489e5f12f0405cedc63367eee0dd6bdae5ca87ac6f67ce34bb7b1685580461616436d0fc9d7823fe23e12fdaf7ad9faf0b51bb02afec62965bd6cacb9fe9541a6f930e01694e9f5e204a73b6a10cdc554dbc7530d505e2a96ecad4946a081'));
    
} catch (error) {
    console.log('na')
}