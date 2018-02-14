'use strict';

import { notEqual } from 'assert';

const express = require('express');
// Create an router instance (aka "mini-app")
const router = express.Router();

const mongoose = require('mongoose');
mongoose.Promise = global.promise;

const Note = require('../models/note');

/* ========== GET/READ ALL ITEM ========== */
router.get('/notes', (req, res, next) => {
  const { searchTerm } = req.query;

  let filter = {};
  let projection = {};
  let sort = 'created';

  if (searchTerm) {
    filter.$text = { $search: searchTerm };
    projection.score = { $meta: 'textScore' }
    sort = projection;
  }
  
  Note
  .find(filter, projection)
  .select('title content created')
  .sort(sort)
  .then(results => {
    res.json(results);
  })
  .catch(next);
});

/* ========== GET/READ A SINGLE ITEM ========== */
router.get('/notes/:id', (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  Note.findById(id)
    .select('id title content')
    .then(result => {
      if(result) {
        res.json(result);
      } else {
        next();
      }
    })
    .catch(next);
  });

/* ========== POST/CREATE AN ITEM ========== */
router.post('/notes', (req, res, next) => {
  const { title, content } = req.body;

  Note.create(newItem)
  .then(result => {
    res.location(`${req.originalUrl}/${result.id}`).status(201)
    .json(result);
  })
  .catch(next);
});

/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/notes/:id', (req, res, next) => {
  const { id } = req.params;
  const { title, content } = req.body;

  const updateItem = { title, content };
  const options = {new : true};

  Note.findByIdAndUpdate(id, updateItem, options)
    .select('id title content')
    .then(result => {
      if (result) {
        res.json(result);
      } else {
        next();
      }
    })
    .catch(next);
  });

/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/notes/:id', (req, res, next) => {
  const { id } = req.params;

  Note.findByIDAndRemove(id)
  .then(count => {
    if (count) {
      res.status(204).end();
    } else {
      next();
    }
    })
    .catch(next);
  });

module.exports = router;