const { json } = require('body-parser');
const express = require('express');
const https = require('https');
const path = require('path');
const fs = require('fs');
const Datastore = require('nedb');

const app = express();

app.use(express.json());

// const sslServer = https.createServer({
//     key: fs.readFileSync(path.join(__dirname, 'cert', 'key.pem')),
//     cert: fs.readFileSync(path.join(__dirname, 'cert', 'cert.pem')),
// }, app) 
const password = 'n060895sdd180994r' // Password for 'Alarm-Server-Authentication' which is passed as an extra header with the requests sent to this server

const webhooks = new Datastore('webhooks.db'); // database where the webhooks potentially get stored, maybe unneccessary 
webhooks.loadDatabase();
const alarms = new Datastore('alarms.db');
alarms.loadDatabase();

// create new Database for alarms, that will cross reference with webhooks.db 

app.get('/', (req, res) =>{
    res.send('Hello World');
});

app.get('/api/webhooks', (req, res) => {
    webhooks.find({}, function (err, docs) {
        if(err){
            return res.status(404).send('The database was not found!');
        }else{
            if(req.header('Alarm-Server-Authentication')!== password){
                res.status(401).send('You are not authorized to make this request!')
            }else{
                if(docs.length === 0){
                    return res.send('The database is empty!');
                }else{
                return res.send(docs);
                }
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
        if(req.header('Alarm-Server-Authentication')!== password){
            res.status(401).send('You are not authorized to make this request!')
        }else{
           return res.send(docs);
        }
       }
   })
});

app.post('/api/webhooks', (req, res) =>{ 
    if(req.header('Alarm-Server-Authentication')!== password){
        res.status(401).send('You are not authorized to make this request!')
    }else{
    const webhook = req.body; 
    webhooks.insert(webhook);
    res.send(webhook);
    // Insert here: check if shop && product_id in alarm, if yes check if webhook inventory <= alarm inventory, if yes send nodemail
    }
});

app.delete('/api/webhooks/:id', (req, res) => {
    if(req.header('Alarm-Server-Authentication')!== password){
        res.status(401).send('You are not authorized to make this request!')
    }else{
    webhooks.remove({id: req.body.id},{}, (err, numRemoved) => {
        if(err){
           console.log('An error has occurred, ', err);
           return res.status(404).send('The webhook ID was not found!')
        }else{
            return res.send(`${numRemoved} Webhook with ID: ${req.body.id} has been deleted`);
        }
    })
    }
    });


app.post('/api/alarms', (req, res) =>{
    if(req.header('Alarm-Server-Authentication')!== password){
        res.status(401).send('You are not authorized to make this request!')
    }else{
    const alarm = req.body; 
    alarms.insert(alarm);
    res.send(alarm);
    }
});

// put, get?, delete request for api/alarms

const port = process.env.PORT || 3000;

// sslServer.listen(port, () => console.log(`Listening on port ${port}...`))
app.listen(port, () => console.log(`Listening on port ${port}...`));


/*  
    Commit changes to git and to code pipeline on aws:
    git add .
    git commit -m '*commit comment'
    git push origin main
*/
