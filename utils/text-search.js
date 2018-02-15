'use strict';

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const { MONGODB_URI } = require('../config');
const Note = require('../models/note');

mongoose.connect(MONGODB_URI)
  .then(() => {
    return Note.find({ $text: { $search: 'ways' } },{ score: { $meta: 'textScore' } })
      .sort({ score: { $meta: 'textScore' } })
      .then(results => {
        console.log(results);
      });
  })
  .then(() => {
    return mongoose.disconnect()
      .then(() => {
        console.info('Disconnected');
      });
  })
  .catch(err => {
    console.error(`ERROR: ${err.message}`);
    console.error(err);
  });
