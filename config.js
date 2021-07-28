var config = {};

config.socketIO = {};
config.npmClient ={};
config.mysqlINFO = {};


config.socketIO.port = 4001;
config.npmClient.siteName = "192.168.1.239";


config.mysqlINFO.host = 'localhost';
config.mysqlINFO.user = 'root';
config.mysqlINFO.password = 'rootpassword123!';
config.mysqlINFO.Database = 'orientation_tool';

module.exports = config;
