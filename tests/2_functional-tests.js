/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       
*/

const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
const ObjectId = require('mongodb').ObjectId; 


chai.use(chaiHttp);
suite('Functional Tests', function() {

  /*
  * ----[EXAMPLE TEST]----
  * Each test should completely test the response of the API end-point including response status code!
  */
  test('#example Test GET /api/books', function(done){
     chai.request(server)
      .get('/api/books')
      .end(function(err, res){
        assert.equal(res.status, 200);
        assert.isArray(res.body, 'response should be an array');
        assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount');
        assert.property(res.body[0], 'title', 'Books in array should contain title');
        assert.property(res.body[0], '_id', 'Books in array should contain _id');
        done();
      });
  });
  /*
  * ----[END of EXAMPLE TEST]----
  */

  suite('Routing tests', function() {


    suite('POST /api/books with title => create book object/expect book object', function() {
      
      test('Test POST /api/books with title', function(done) {
        chai.request(server)
          .post('/api/books')
          .send({title:'testTitle'})
          .end((err,res)=>{
            assert.equal(res.status, 200);
            assert.equal(res.body.title, 'testTitle');
            done();
        })
      });
      
      test('Test POST /api/books with no title given', function(done) {
        chai.request(server)
          .post('/api/books')
          .send({})
          .end((err,res)=>{
            assert.equal(res.status, 200);
            assert.equal(res.text, 'missing required field title');
            done();
        })
      });
      
    });


    suite('GET /api/books => array of books', function(){
      
      test('Test GET /api/books',  function(done){
        chai.request(server)
          .get('/api/books')
          .end((err,res)=>{
            assert.equal(Array.isArray(res.body),true)
            done();
        })
      });      
      
    });


    suite('GET /api/books/[id] => book object with [id]', function(){
      
      test('Test GET /api/books/[id] with id not in db',  function(done){
        chai.request(server)
          .get('/api/books/unvalidID')
          .end((err,res)=>{
            assert.equal(res.text,'no book exists')
            done();
        })
      });
      
      test('Test GET /api/books/[id] with valid id in db',  function(done){
        let bookid
        chai.request(server)
          .post('/api/books')
          .send({title:'checkValidBookId'})
          .end((err,res)=>{
            assert.equal(res.status, 200);
            bookid = res.body._id
            chai.request(server)
              .get('/api/books/' + bookid)
              .end((err,res)=>{
                assert.equal(res.body._id,new ObjectId(bookid))
                done();
            })
        })
      });
      
    });


    suite('POST /api/books/[id] => add comment/expect book object with id', function(){
      
      test('Test POST /api/books/[id] with comment', function(done){
            let bookid
            chai.request(server)
              .post('/api/books')
              .send({title:'checkValidBookComment1'})
              .end((err,res)=>{
                assert.equal(res.status, 200);
                bookid = res.body._id
                chai.request(server)
                  .post('/api/books/' + bookid)
                  .send({comment:'testComment'})
                  .end((err,res)=>{
                    assert.equal(res.status, 200);
                    assert.equal(res.body._id,bookid)
                    assert.equal(res.body.comments[0],'testComment')
                    done();
                })
            });
      });

      test('Test POST /api/bosoks/[id] without comment field', function(done){
        let bookid
        chai.request(server)
          .post('/api/books')
          .send({title:'checkValidBookComment2'})
          .end((err,res)=>{
            assert.equal(res.status, 200);
            bookid = res.body._id
            chai.request(server)
              .post('/api/books/' + bookid)
              .send({})
              .end((err,res)=>{
                assert.equal(res.status, 200);
                assert.equal(res.text,'missing required field comment');
                done();
            })
        })
      });

      test('Test POST /api/books/[id] with comment, id not in db', function(done){
        chai.request(server)
          .post('/api/books/unvalidID')
          .send({title:'checkValidBookComment'})
          .end((err,res)=>{
            assert.equal(res.status, 200);
            assert.equal(res.text,'no book exists');
            done();
        })
      });
      
    });

    suite('DELETE /api/books/[id] => delete book object id', function() {

      test('Test DELETE /api/books/[id] with valid id in db', function(done){
        this.timeout(10000)
        let bookid;
        chai.request(server)
          .post('/api/books')
          .send({title:'checkDeleteBook'})
          .end((err,res)=>{
            assert.equal(res.status, 200);
            bookid = res.body._id
            chai.request(server)
              .delete('/api/books/' + bookid)
              .end((err,res)=>{
                assert.equal(res.status, 200);
                assert.equal(res.text,'delete successful');
                done();
            })
        })
      });

      test('Test DELETE /api/books/[id] with  id not in db', function(done){
        chai.request(server)
          .delete('/api/books/unvliadId')
          .end((err,res)=>{
            assert.equal(res.status, 200);
            assert.equal(res.text,'no book exists');
            done();
        })
      });

    });

  });

});
