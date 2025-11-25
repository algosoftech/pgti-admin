const moment = require('moment');

function createSlug(input) {
  return input
    .toString()                    // Convert to string
    .toLowerCase()                 // Convert to lowercase
    .replace(/\s+/g, '-')          // Replace spaces with hyphens
    .replace(/[^\w-]+/g, '')       // Remove non-word characters (excluding hyphens)
    .replace(/--+/g, '-');         // Replace multiple hyphens with a single hyphen
}



function getIpAddress(req){
  try {
    return req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  } catch (error) {
    return ':1'
  }
}

function generateRandomString(length) {
  const characters = '123456789ABCDEFGHJKMNPQRSTUVWXYZ';
  let result = '';
  const charactersLength = characters.length;
  
  for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  
  return result;
}

module.exports = {
    createSlug,
    getIpAddress,
    generateRandomString,
};