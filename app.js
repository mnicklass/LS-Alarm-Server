const { json } = require('body-parser');
const express = require('express');
const https = require('https');
const path = require('path');
const fs = require('fs');
const Datastore = require('nedb');

const app = express();

app.use(express.json());

/* const sslServer = https.createServer({
    key: fs.readFileSync(path.join(__dirname, 'cert', 'key.pem')),
    cert: fs.readFileSync(path.join(__dirname, 'cert', 'cert.pem')),
}, app) */

const webhooks = new Datastore('webhooks.db');
webhooks.loadDatabase();

app.get('/', (req, res) =>{
    res.send('Hello World');
});

app.get('/api/webhooks', (req, res) => {
    webhooks.find({}, function (err, docs) {
        if(err){
            return res.status(404).send('The database was not found!');
        }else{
            if(docs.length === 0){
                return res.send('The database is empty!');
            }else{
            return res.send(docs);
            }
        }
    });
});

app.get('/api/webhooks/:id', (req, res) => {
   webhooks.find({id: req.body.id},(err, docs) => {
       if(err){
          console.log('An error has occurred, ', err);
          return res.status(404).send('The webhook ID was not found!')
       }else{
           return res.send(docs);
       }
   })
});

app.post('/api/webhooks', (req, res) =>{
    const webhook = req.body; 
    webhooks.insert(webhook);
    res.send(webhook);
});

app.delete('/api/webhooks/:id', (req, res) => {
    webhooks.remove({id: req.body.id},{}, (err, numRemoved) => {
        if(err){
           console.log('An error has occurred, ', err);
           return res.status(404).send('The webhook ID was not found!')
        }else{
            return res.send(`${numRemoved} Webhook with ID: ${req.body.id} has been deleted`);
        }
    })
});

const port = process.env.PORT || 3000;

// sslServer.listen(port, () => console.log(`Listening on port ${port}...`))
app.listen(port, () => console.log(`Listening on port ${port}...`));
