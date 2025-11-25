const crypto = require('crypto');
const fs = require('fs');
const generateFileName = (bytes = 6) => crypto.randomBytes(bytes).toString('hex');
const util = require('util');
const writeFileAsync = util.promisify(fs.writeFile);
const moment = require("moment");
const path = require("path");
/* ********************************************************************************
* Function Name   : upload_img
* Purposes        : This function is used toupload image to s3 bucket
* Creation Date   : 19-09-2023
************************************************************************************/ 
exports.upload_img = async (file, folder="images") => {
    return new Promise(async (resolve, reject) => {
        try{
            const {buffer, originalname } = file;
            const ext = path.extname(originalname) || '.jpg';
            const imgName = generateFileName();
            const folderPath = path.join(__dirname, `../public/assets/${folder}/${moment().format("MMM-YY")}`);
            const imgPath = path.join(folderPath, `${imgName}${ext}`);
            await fs.promises.mkdir(folderPath, { recursive: true });
            await writeFileAsync(imgPath, buffer);
            resolve(`./assets/${folder}/${moment().format("MMM-YY")}/${imgName}${ext}`);
        } catch (error){
            console.log('error',error)
            const result = "";
            reject(result);
        }
    });
};
/* ********************************************************************************
* Function Name   : delete_img
* Purposes        : This function is used to 
* Creation Date   : 19-09-2023
************************************************************************************/ 
exports.delete_img = async (imgPath) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!imgPath) return reject("No image path provided");

            // Construct the absolute path of the image
            const fullPath = path.join(__dirname, `../public/${imgPath.replace('./', '')}`);

            // Check if file exists
            const fileExists = await fs.promises.access(fullPath).then(() => true).catch(() => false);
            if (fileExists) {
                await fs.promises.unlink(fullPath);
                resolve({ status: true, message: "Image deleted successfully" });
            } else {
                resolve({ status: false, message: "Image not found" });
            }

        } catch (error) {
            console.log('error', error);
            reject({ status: false, message: "Error deleting image", error });
        }
    });
};

