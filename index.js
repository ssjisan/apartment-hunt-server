const express = require('express')
const app = express()
const cors = require('cors')
const fs = require('fs-extra')
const fileUpload = require('express-fileupload');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()
const bodyParser = require('body-parser')

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('doctors'));
app.use(fileUpload());

const port = 3030;

app.get('/',(req,res)=>{
    res.send("hello DB")
})

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.larxv.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true ,useUnifiedTopology: true});
client.connect(err => {
  const renterCollection = client.db("apartment-hunt").collection("renterList");
  const houseCollection = client.db("apartment-hunt").collection("houseList");
/*****************************************Add House Start********************************/ 
  app.post('/addHouse', (req,res)=>{
    const file = req.files.file;
    const service = req.body.service;
    const price = req.body.price;
    const location = req.body.location;
    const bathroom = req.body.bathroom;
    const bedroom = req.body.bedroom;
    console.log(service,price,location,bedroom,bathroom,file);
    const filePath= `${__dirname}/house/${file.name}`;
    file.mv(filePath ,error=>{
      if(error){
        console.log(error);
        return res.status(500).send({msg:"Failed"})
      }
      const newImg = fs.readFileSync(filePath);
      const encImg = newImg.toString('base64');
      var image = {
        contentType: req.files.file.mimetype,
        size: req.files.file.size,
        img: Buffer(encImg, 'base64')
      }
      
      houseCollection.insertOne({service,location,price,bathroom,bedroom,image})
      .then(result=>{
        res.send(result.insertedCount>0)
      })
      return res.send({name: file.name, path: `/${file.name}`})
    })
  })
/*****************************************Add House End********************************/ 

/*****************************************Send Data to site  Start********************************/ 
app.get('/house', (req, res) => {
  houseCollection.find({})
          .toArray((err, documents) => {
              res.send(documents);
          })
  });
/*****************************************Send Data to site  End********************************/ 

/*****************************************Rent Request Start***************************************/ 
app.post('/addBooking', (req, res) => {
  const name = req.body.name;
  const number = req.body.number;
  const email = req.body.email;
  const message = req.body.message;
  const status = req.body.status;

  bookingCollection.insertOne({ name, number, email, message, status })
      .then(result => {
          res.send(result.insertedCount > 0)
      })
});
/*****************************************Rent Request End***************************************/ 


  app.post('/rentList',(req,res)=>{
    const date = req.body;
    console.log(date);
    renterCollection.find({})
      .toArray((err,documents)=>{
        res.send(documents);
      })
  })

});





app.listen(process.env.PORT || port)