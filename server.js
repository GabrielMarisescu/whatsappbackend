const express = require("express")
const mongoose = require("mongoose")
const Messages = require("./DBMessages")
const Pusher = require("pusher");
const cors = require("cors")


const app = express()
const port =  process.env.PORT || 9000






const pusher = new Pusher({
    appId: "1116026",
    key: "9fb53245634578e4912d",
    secret: "999498d2bdb1628999de",
    cluster: "eu",
    useTLS: true
  });

  const db = mongoose.connection
  db.once("open", () => {
      console.log("db connesso")

      const msgCollection = db.collection("messagecontents")
      const changeStream = msgCollection.watch()

      changeStream.on("change", (change) => {
          console.log(change);


          if (change.operationType === "insert") {
              const messageDetails = change.fullDocument;
              pusher.trigger("messages", "inserted", {
                   name: messageDetails.name,
                   message:messageDetails.message,
                   timestamp: messageDetails.timestamp,
                   received : messageDetails.received
              });
          }
          else { console.log("Error Triggering Pusher")

          }

      })
  })



app.use(express.json())
app.use(cors());





app.get("/",(req,res) => {
    res.status(200).send("hello")

})

app.post("/messages/new", (req,res) =>  {
    const dbMessage = req.body


    Messages.create(dbMessage, (err,data)=> {
        if (err) {
            res.status(500).send(err)
        }
        else {
            res.status(201).send(data)
        }
    })
})









app.get("/messages/sync", (req,res) =>  {

    Messages.find((err,data) => {
         if (err) {
             res.status(500).send(err)
         }
         else {
             res.status(200).send(data)
         }
    })
})





app.listen(port,() => {
    console.log(  `${port} sta ascoltando` )
})

const connectionUrl = "mongodb+srv://admin:EAj8mliWKx5P6cBN@cluster0.vmpub.mongodb.net/WhatsappDB?retryWrites=true&w=majority"
mongoose.connect(connectionUrl, { useCreateIndex:true, useNewUrlParser:true, useUnifiedTopology:true})






