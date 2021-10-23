/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';
require('dotenv').config();

const { MongoClient } = require('mongodb');
const uri = process.env.MONGO_URI;
const client = new MongoClient(uri, { useUnifiedTopology: true}, { useNewUrlParser: true }, { connectTimeoutMS: 30000 }, { keepAlive: 1});
const ObjectId = require('mongodb').ObjectId; 

module.exports = function (app) {
  /*----
  //catch all res
  app.use(function logResponseBody(req, res, next) {
  var oldWrite = res.write,
      oldEnd = res.end;

  var chunks = [];

  res.write = function (chunk) {
    chunks.push(chunk);

    return oldWrite.apply(res, arguments);
  };

  res.end = function (chunk) {
    if (chunk)
      chunks.push(chunk);

    var body = Buffer.concat(chunks).toString('utf8');
    console.log(`${req.method}: ${req.path} ${JSON.stringify(req.body)} ---> ${body}`);

    oldEnd.apply(res, arguments);
  };

  next();
})
  
----*/
  app.route('/api/books')
    .get(function (req, res){
      const filter = req.query;
      if(filter._id){filter._id = new ObjectId(filter._id)}
      client.connect(err=>{
        const collection = client.db("personalLibrary").collection('books');
         collection.find(filter).toArray((err,data)=>{
           if(err){return res.send(err)};
           if(data){return res.send(data)};
         })
      });
    })
    
    .post(function (req, res){
      let title = req.body.title;
      if(!title){return res.send('missing required field title')};
      client.connect(err => {
        const collection = client.db("personalLibrary").collection('books');
        const newBook = collection.insertOne({
          title,commentcount:0,comments:[]
        },(err,data)=>{
            if(err){return res.send(err)};
            if(data){return res.send(data.ops[0])};
          })
      });
    })
    
    .delete(function(req, res){
      client.connect(err=>{
        const collection = client.db("personalLibrary").collection('books');
        collection.deleteMany({},(err,success)=>{
          if(err){return res.send(err)}
          if(success){return res.send('complete delete successful')}
        })
      })
    });


  app.route('/api/books/:id')
    .get(function (req, res){
      let bookid = req.params.id;
      if(!(/^[0-9a-fA-F]{24}$/).test(bookid)){return res.send('no book exists')}
      const targetBook = {_id: new ObjectId(bookid)};
      client.connect(err=>{
        const collection = client.db("personalLibrary").collection('books');
         collection.findOne(targetBook,(err,data)=>{
           if(err||!data){return res.send('no book exists')};
           if(data){return res.send(data)};
         })
      });
    })
    
    .post(function(req, res){
      let bookid = req.params.id;
      if(!(/^[0-9a-fA-F]{24}$/).test(bookid)){return res.send('no book exists')}
      let comment = req.body.comment;
      if(!comment){return res.send('missing required field comment');}
      const targetBook = {_id: new ObjectId(bookid)};
      client.connect(err=>{
        const collection = client.db("personalLibrary").collection('books');
        collection.findOneAndUpdate(targetBook,{$push:{comments:comment},$inc:{commentcount:1}},{returnOriginal:false},(err,data)=>{
          if(err||!data.value){return res.send('no book exists')};
          if(data){return res.send(data.value)}
      })
      })
    })
    
    .delete(function(req, res){
      let bookid = req.params.id;
      if(!(/^[0-9a-fA-F]{24}$/).test(bookid)){return res.send('no book exists')}
      if(!bookid){return res.send('missing required field comment')}
      const targetBook = {_id: new ObjectId(bookid)};
      client.connect(err=>{
        const collection = client.db("personalLibrary").collection('books');
        collection.deleteOne(targetBook,(err,data)=>{
          if(err||data.deletedCount===0){return res.send('no book exists')}
          if(data){return res.send('delete successful')}
        })
      })
      
    });
  
};
