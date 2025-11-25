const moment = require('moment');
const fs = require("fs").promises;
const createLogs = async (req,log,payload={}) => {
    try {
        const logEntry = {
            output: log,
            payload : payload,
            ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
            timestamp: moment().format('YYYY-MM-DD hh:mm:ss'),
            success: true, 
          };    
          fs.appendFile(`asset/${moment().format('YYYY_MM_DD')}.log`, JSON.stringify(logEntry) + "\n");
        return true;
    } catch (error) {
        console.log('error : ',error);
        return true;
    }
}

const getLogs = async (date) => {
    try {
        let data = [];
        if(fs.access(`asset/${date}.log`)){
            data = await fs.readFile(`asset/${date}.log`, "utf8");
        }
        const jsonArray = Promise.all(data
            .trim()
            .split("\n")
            .map((line) => JSON.parse(line))); 
        return jsonArray;
    } catch (error) {
        return [];
    }
}

module.exports = {
    createLogs : createLogs,
    getLogs : getLogs
};
