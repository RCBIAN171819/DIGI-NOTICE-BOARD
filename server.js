const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

app.use(express.static('public'));
app.use(bodyParser.json());

const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: (req, file, callback) => {
        callback(null, 'image_' + Date.now() + path.extname(file.originalname));
    }
});


app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

app.options('*', (req, res) => {
    res.sendStatus(200);
});


function ensureDirectoryExists(directory) {
    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
    }
}


app.get('/listFiles', (req, res) => {
    const directoryPath = './public/uploads';
    fs.readdir(directoryPath, (err, files) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to list files.' });
            return;
        }
        res.json({ files: files });
    });
});


app.delete('/deleteFile', (req, res) => {
    const { fileName } = req.body;
    const filePath = path.join('./public/uploads', fileName);
    fs.unlink(filePath, (err) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to delete file.' });
            return;
        }
        res.json({ success: true });
    });
});


const upload = multer({
    storage: multer.diskStorage({
        destination: './public/uploads/',
        filename: (req, file, callback) => {
            callback(null, 'file_' + Date.now() + path.extname(file.originalname));
        }
    }),
    fileFilter: (req, file, callback) => {
        if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
            callback(null, true);
        } else {
            callback(new Error('Only image and video files are allowed.'));
        }
    }
});


app.post('/upload', upload.single('file'), (req, res) => {
    const filePath = req.file.path.replace('public', '');
    res.json({ filePath: filePath });
});


app.post('/convertToTextFile', (req, res) => {
    const { textContent } = req.body;
    const directoryPath = './public/uploads';
    const timestamp = new Date().toISOString().replace(/[-:.]/g, '');
    const filePath = path.join(directoryPath, `textFile_${timestamp}.txt`);

    ensureDirectoryExists(directoryPath);

    fs.writeFile(filePath, textContent, (err) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to save text file.' });
            return;
        }

        res.json({ filePath: filePath });
    });
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on http://0.0.0.0:${port}`);
});