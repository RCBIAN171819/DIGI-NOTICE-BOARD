const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3002;
const directoryPath = './public/uploads';


app.use(express.static('public'));


app.use('/images', express.static(path.join(__dirname, 'public/images')));


app.get('/files', (req, res) => {
    fs.readdir(directoryPath, (err, files) => {
        if (err) {
            console.error('Error reading directory:', err);
            res.status(500).send('Error reading directory');
            return;
        }

        
        const filteredFiles = files.filter(file => {
            const ext = path.extname(file).toLowerCase();
            return ext === '.txt' || ext === '.jpg' || ext === '.jpeg' || ext === '.png' || ext === '.gif' || ext === '.mp4';
        });

        
        res.json(filteredFiles);
    });
});


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});


app.get('/files.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'files.html'));
});

app.get('/preview.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'preview.html'));
});

    
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});


setInterval(() => {
    console.log('Scanning directory...');
    fs.readdir(directoryPath, (err, files) => {
        if (err) {
            console.error('Error reading directory:', err);
            return;
        }
        console.log('Files in directory:', files);
    });
}, 15000);
