'use strict';

const mongoose = require('mongoose');

const noteSchema = mongoose.Schema ({
  title: String,
  content: String,
  //uncertain about below - need {} or no?
  created: {type: Date, default: Date.now}
});

noteSchema.set('toObject', {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret._v;
  }
});

const Note = mongoose.model('Note', noteSchema);

module.exports = Note;