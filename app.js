const express = require('express')
const app = express()
const http = require('http')
const chalk = require('chalk')
const fs = require('fs')
const fileUpload = require('express-fileupload')
const shortid = require('shortid')
const mime = require('mime-types')
const path = require('path');
const checkDiskSpace = require('check-disk-space');
const mb = require('./lib/msgBuilder.js')
const isValidJSON = require('./lib/isvalidjson.js')

const dataFile = `${__dirname}/config.json`;

// Load config
let config;
let cfile = fs.readFileSync(dataFile).toString();
if (isValidJSON(cfile)) config = JSON.parse(cfile)
else {
    console.error(chalk.red('Your config.json is not valid JSON. Exiting.'))
    return process.exit(0);
}

app.set('view engine', 'ejs')
app.enable('trust proxy')

// Make sure path is absolute
if (!path.isAbsolute(config.uploadDir)) config.uploadDir = `${__dirname}/${config.uploadDir}`

app.get('/', (req, res) => {
    checkDiskSpace(config.uploadDir).then(diskSpace => {
        let usedDisk = Math.round((diskSpace.size - diskSpace.free) / Math.pow(1024, 3) * 10) / 10
        let totalDisk = Math.round(diskSpace.size / Math.pow(1024, 3) * 10) / 10
        let diskPercentage = Math.round(usedDisk / totalDisk * 100)
        res.render('index', {
            title: config.siteTitle,
            disk: {
                used: usedDisk,
                total: totalDisk,
                percentage: diskPercentage
            },
            theme: config.theme
        })
    })
})

app.use(fileUpload())

app.post('/upload', (req, res) => {
    let key = req.get('key');
    // Validate key
    if (!key || key !== config.key) return res.json(mb(false, 'Invalid key.'))

    // Get first file
    let file = req.files[Object.keys(req.files)[0]];

    // Check if file extension is allowed
    let extension = false;
    for (e of config.allowedExtensions) {
        if (mime.lookup(`.${e}`) !== file.mimetype) continue;
        extension = `${e}`;
        break;
    }

    if (!extension) return res.json(mb(false, 'Illegal file type.'))

    // Generate file name and make sure it doesn't exist already
    let genName = () => {
        name = `${shortid.generate()}.${extension}`;
        if (fs.existsSync(path.join(config.uploadDir, name))) genName()
    }
    let name;
    genName()

    // Save file
    fs.writeFile(path.join(config.uploadDir, name), file.data, err => {
        if (err) {
            res.json(mb(false, 'Could not save the uploaded file.'))
            return console.error(err)
        }
        res.json(mb(true, `${req.protocol}://${req.get('host')}/u/${name}`))
    })
})

// Serve files
app.get('/u/:file', (req, res) => {
    let file = req.params.file
    // Validate file name
    if (!file) return res.redirect('/')
    if (!fs.existsSync(path.join(config.uploadDir, file))) return res.sendStatus(404)
    res.sendFile(path.join(config.uploadDir, file))
})

// 404 redirect to home
app.use((req, res) => {
    res.redirect('/')
})

// HTTP server
const httpServer = http.createServer(app)
httpServer.listen(config.port, () => {
    console.log(chalk.green(`HTTP API listening on 0.0.0.0:${config.port}`))
    // Clear tmp dir on startup
    fs.readdir(config.uploadDir, {}, (err, files) => {
        if (err) return console.error(err)
        files.forEach(f => fs.unlink(path.join(config.uploadDir, f), () => {}))
    })
});