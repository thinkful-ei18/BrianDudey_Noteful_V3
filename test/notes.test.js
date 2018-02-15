'use strict';
const app = require('../server');

//Testing with Chai/Mocha
const chai = require('chai');
const chaiHttp = require('chai-http');
const chaiSpies = require('chai-spies');
const expect = chai.expect;

chai.use(chaiHttp);
chai.use(chaiSpies);

//Require mongoose and import port and seed data
const mongoose = require('mongoose');
const { TEST_MONGODB_URI } = require('../config');
const Note = require('../models/note');
const seedData = require('../db/seed/notes');

describe('hooks', function() {

  before(function() {
    return mongoose.connect(TEST_MONGODB_URI, {autoIndex: false});
  });

  beforeEach(function() {
    return Note.insertMany(seedNotes)
      .then(() => Note.ensureIndexes());
  });
  
  afterEach(function() {
    return mongoose.connection.db.dropDatabase();
  });
  
  after(function() {
    return mongoose.disconnect();
  })
});

describe('POST /v3/notes', function() {
  it('should create and return a new item when provided valid data', function () {
    const newItem = {
      'title': 'The best article about cats ever!',
      'content': 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor...',
      'tags': []
    };
    let body;
    return chai.request(app)
    .post('/v3/notes')
    .send(newItem)
    .then(function (res) {
      body = res.body;
      expect(res).to.have.status(201);
      expect(res).to.have.header('location');
      expect(res).to.have.header('location');
      expect(res).to.be.json;
      expect(body).to.be.an('object');
      expect(body).to.include.keys('id', 'title', 'content');
      return Note.findById(body.id);
    })
    .then(data => {
      expect(body.title).to.equal(data.title);
      expect(body.content).to.equal(data.content);
    });
  });
});



describe('GET /v3/notes/:id', function () {

  it('should return correct notes', function () {
    let data;
    // 1) First, call the database
    return Note.findOne().select('id title content')
      .then(_data => {
        data = _data;
        // 2) **then** call the API
        return chai.request(app).get(`/v3/notes/${data.id}`);
      })
      .then((res) => {
        expect(res).to.have.status(200);
        expect(res).to.be.json;

        expect(res.body).to.be.an('object');
        expect(res.body).to.have.keys('id', 'title', 'content');

        // 3) **then** compare
        expect(res.body.id).to.equal(data.id);
        expect(res.body.title).to.equal(data.title);
        expect(res.body.content).to.equal(data.content);
      });
  });
});

describe('POST /v3/notes', function () {

  it('should create and return a new item when provided valid data', function () {
    const newItem = {
      'title': 'The best article about cats ever!',
      'content': 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor...',
      'tags': []
    };
    let body;
    return chai.request(app)
      .post('/v3/notes')
      .send(newItem)
      .then(function (res) {
        body = res.body;
        expect(res).to.have.status(201);
        expect(res).to.have.header('location');
        expect(res).to.be.json;
        expect(body).to.be.a('object');
        expect(body).to.include.keys('id', 'title', 'content');
        return Note.findById(body.id);
      })
      .then(data => {
        expect(body.title).to.equal(data.title);
        expect(body.content).to.equal(data.content);
      });
  });


it('should return an error when missing "title" field', function () {
  const newItem = {
    'foo': 'bar'
  };
  const spy = chai.spy();
  return chai.request(app)
    .post('/v3/notes')
    .send(newItem)
    .then(spy)
    .catch(err => {
      const res = err.response;
      expect(res).to.have.status(400);
      expect(res).to.be.json;
      expect(res.body).to.be.a('object');
      expect(res.body.message).to.equal('Missing `title` in request body');
    })
    .then(() => {
      expect(spy).to.not.have.been.called();
    });
});
});

describe('GET /v3/notes', function () {

  it('should return the correct number of Notes', function () {
    // 1) Call the database and the API
    const dbPromise = Note.find();
    const apiPromise = chai.request(app).get('/v3/notes');

    // 2) Wait for both promises to resolve using `Promise.all`
    return Promise.all([dbPromise, apiPromise])
    // 3) **then** compare database results to API response
      .then(([data, res]) => {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.an('array');
        expect(res.body).to.have.length(data.length);
      });
  });
});

describe('GET /v3/notes', function () {
  it('should respond with a 400 for improperly formatted id', function () {
    const badId = '99-99-99';
    const spy = chai.spy();
    return chai.request(app).get(`/v3/notes/${badId}`)
      .then(spy)
      .then(() => {
        expect(spy).to.not.have.been.called();
      })
      .catch(err => {
        const res = err.response;
        expect(res).to.have.status(400);
        expect(res.body.message).to.eq('The `id` is not valid');
      });
    });
  });

  describe('PUT /v3/notes/:id', function () {

    it('should update the note', function () {
      const updateItem = {
        'title': 'this would be a title',
        'content': 'this would be the content'
      };
      let data;
      return Note.findOne().select('id title content')
        .then(_data => {
          data = _data;
          return chai.request(app)
            .put(`/v3/notes/${data.id}`)
            .send(updateItem);
        })
        .then(function (res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.an('object');
          expect(res.body).to.include.keys('id', 'title', 'content');

          expect(res.body.id).to.equal(data.id);
          expect(res.body.title).to.equal(updateItem.title);
          expect(res.body.content).to.equal(updateItem.content);
        });
    });
  });

  it('should return an error when missing the "title" field', function () {
    const updateItem = {
      'foo': 'bar'
    };
    const spy = chai.spy();
    return chai.request(app)
      .put('/v3/notes/9999')
      .send(updateItem)
      .then(spy)
      .catch(err => {
        const res = err.response;
        expect(res).to.have.status(400);
        expect(res).to.be.json;
        expect(res.body).to.be.an('object');
        expect(res.body.message).to.equal('Missing `title` in request body');
      })
      .then(() => {
        expect(spy).to.not.have.been.called();
      });
  });


  
  Not working "notes not defined"
  describe('GET /v3/notes', function() {
    it('should return all existing notes', function () {
      let res;
      return chai.request(app)
        .get('/v3/notes')
        .then(_res => {
          res = _res;
          expect(res).to.have.status(200);
          expect(res.body).to.have.length.of.at.least(1);
          return Note.count();
        })
        .then(count => {
          expect(res.body).to.have.length.of(count);
        });
    });
  });

  describe('PUT endpoint /v3/notes/:id', function () {

    it('Update a Note with the new user-supplied information', function () {
      const updateData = {
        title: 'this would be the title',
        content: 'this would be the content',
      };

      return Note
        .findOne()
        .then(data => {
          updateData.id = data.id;

          return chai.request(app)
            .put(`/v3/notes/${data.id}`)
            .send(updateData);
        })
        .then(res => {
          expect(res).to.have.status(200);
          return Note.findById(updateData.id);
        })
        .then(data => {
          expect(data.title).to.equal(updateData.title);
          expect(data.content).to.equal(updateData.content);
        });
    });
  });

  describe('DELETE endpoint /v3/notes/:id', function () {
    it('should delete a post by id', function () {

      let data;

      return Note
        .findOne()
        .then(_data => {
          data = _data;
          return chai.request(app).delete(`/v3/notes/${data.id}`);
        })
        .then(res => {
          expect(res).to.be.status(204);
          return Note.findById(data.id);
        })
        .t
        then(_data => {
          should.not.exist(_data);
        });
    });
  });