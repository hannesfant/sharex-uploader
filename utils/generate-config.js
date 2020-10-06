const fs = require('fs');
const isValidJSON = require('../lib/isvalidjson.js');
const chalk = require('chalk');

let requestURL;
if (process.argv.length >= 3) {
	requestURL = process.argv[2];
} else {
	console.error(chalk.red('No installation URL given. Exiting.'));
    return process.exit(0);
}

const configFilePath =  `${__dirname}/../config.json`;
let config;
let configFile;
try {
	configFile = fs.readFileSync(configFilePath).toString();
} catch (err) {
	console.error(chalk.red(err));
	return process.exit(0);
}

if (isValidJSON(configFile)) {
	config = JSON.parse(configFile);
} else {
	console.error(chalk.red('Your config.json is not valid JSON. Exiting.'));
    return process.exit(0);
}

const secretKey = config.key;

const uploaderSetting = {
	"Version": "12.4.1",
	"DestinationType": "ImageUploader, FileUploader",
	"RequestMethod": "POST",
	"RequestURL": '',
	"Headers": {
		"key": ''
	},
	"Body": "MultipartFormData",
	"FileFormName": "file"
}

uploaderSetting.Headers.key = secretKey;
uploaderSetting.RequestURL = requestURL[requestURL.length-1] == '/' ? requestURL + 'upload' : requestURL + '/upload';

uploaderSettingString = JSON.stringify(uploaderSetting, null, 4);

console.log(chalk.green('Writing json to uploader-setting.json... \n'));
try {
	fs.writeFileSync('./uploader-setting.json', uploaderSettingString);
} catch (err) {
	console.error(chalk.red(err));
	return process.exit(0);
}

console.log(uploaderSetting);