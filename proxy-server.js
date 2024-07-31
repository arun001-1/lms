import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';
import multer from 'multer';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const fse = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,"./uploads");
    },
    filename:(req,file,cb)=>{
        cb(null,Date.now()+"--"+file.originalname);
    }
})

const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
//const upload = multer({ dest: 'uploads/' });
const upload = multer({storage:fse});

const VIRUSTOTAL_API_KEY = '4b16856d9422b17660a75560f9166206f3d2e28ffa47d2a9fe4bb513a68a2694';
//4b16856d9422b17660a75560f9166206f3d2e28ffa47d2a9fe4bb513a68a2694
//0f94467edfc017b9a00d7a364fe9f36e337dd19a54876a89ccc15aee933a8dbd

app.get('/check-url', async (req, res) => {
    const url = req.query.url;
    const encodedUrl = Buffer.from(url).toString('base64').replace(/=/g, '');

    const apiUrl = `https://www.virustotal.com/api/v3/urls/${encodedUrl}`;

    try {
        const response = await fetch(apiUrl, {
            headers: {
                'x-apikey': VIRUSTOTAL_API_KEY
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok.');
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Failed to fetch data from VirusTotal.' });
    }
});



app.post('/check-file', upload.single('file'), async (req, res) => {

    // res.json({
    //     malicious: 0,
    //     suspicious: 0,
    //     undetected: 62,
    //     harmless: 0,
    //     timeout: 0,
    //     'confirmed-timeout': 0,
    //     failure: 1,
    //     'type-unsupported': 15
    //   })


    const filePath = req.file.path;
    console.log(req.file)
    console.log(filePath)

    try {
        const formData = new FormData();
        formData.append('file', fs.createReadStream(filePath));

        const scanResponse = await fetch('https://www.virustotal.com/api/v3/files', {
            method: 'POST',
            headers: {
                'x-apikey': VIRUSTOTAL_API_KEY
            },
            body: formData
        });

        if (!scanResponse.ok) {
            const errorText = await scanResponse.text();
            throw new Error(`Scan response was not ok: ${errorText}`);
        }

        const scanData = await scanResponse.json();
        const fileId = scanData.data.id;

        const options = {
            method: 'GET',
            headers: {
                accept: 'application/json',
                'x-apikey': VIRUSTOTAL_API_KEY
            }
        };
console.log(fileId)
        const fileInfoResponse = await fetch(`https://www.virustotal.com/api/v3/analyses/${fileId}`, options);
        if (!fileInfoResponse.ok) {
            const errorText = await fileInfoResponse.text();
            throw new Error(`File info response was not ok: ${errorText}`);
        }

        const fileInfoData = await fileInfoResponse.json();
        const stats = fileInfoData.data.attributes.stats;
        console.log(fileId)
        console.log(stats)

        // const data = JSON.stringify(stats);
        
        // console.log(typeof data)

        res.send(fileInfoResponse);
        // console.log(fileId)
        // Clean up the uploaded file
        fs.unlink(filePath, (err) => {
            if (err) console.error('Error deleting uploaded file:', err);
        });
    } catch (error) {
        console.error('Error processing file:', error);
        res.status(500).json({ error: 'Failed to process file with VirusTotal.' });
    }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Proxy server listening on port ${PORT}`);
});