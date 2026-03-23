const express = require('express');
const router = express.Router();
const path = require('path');
const { query, param, body, validationResult } = require('express-validator');
const airbnbModel = require('../models/airbnb');

// Whitelist of allowed fields for updates to prevent NoSQL injection
const ALLOWED_UPDATE_FIELDS = [
  'name', 'description', 'neighborhood_overview', 'picture_url',
  'host_name', 'host_since', 'host_location', 'host_about',
  'host_response_time', 'host_response_rate', 'host_acceptance_rate',
  'host_is_superhost', 'host_thumbnail_url', 'host_picture_url',
  'host_neighbourhood', 'neighbourhood', 'neighbourhood_cleansed',
  'latitude', 'longitude', 'property_type', 'room_type', 'accommodates',
  'bathrooms', 'bedrooms', 'beds', 'amenities', 'price',
  'minimum_nights', 'maximum_nights', 'instant_bookable',
  'number_of_reviews', 'review_scores_rating'
];

// Validation middleware
const validateQuery = [
  query('page').optional().isInt({ min: 0 }).toInt(),
  query('sort').optional().isIn(['ASC', 'DESC']),
  query('field').optional().isString().trim(),
  query('filter').optional().isString().trim()
];

const validateId = [
  param('id').isString().trim().notEmpty()
];

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Sanitize filter to prevent NoSQL injection
const sanitizeFilter = (filter) => {
  if (!filter) return {};
  // Only allow alphanumeric and common date characters
  if (!/^[a-zA-Z0-9\-\s:]+$/.test(filter)) {
    return {};
  }
  return { last_scraped: filter };
};

// Sanitize sort field to prevent injection
const sanitizeSort = (field, sort) => {
  const allowedFields = [
    'name', 'price', 'minimum_nights', 'maximum_nights',
    'number_of_reviews', 'review_scores_rating', 'accommodates'
  ];
  if (field && allowedFields.includes(field)) {
    return [field, sort === 'ASC' ? 1 : -1];
  }
  return [];
};

router.get('/', validateQuery, handleValidationErrors, async (req , res) => {
  try {
    const { sort, filter, field, page } = req.query;

    const total = await airbnbModel.count();

    const safeFilter = sanitizeFilter(filter);
    const safeSort = sanitizeSort(field, sort);

    const data = await airbnbModel
      .find(safeFilter)
      .limit(10)
      .skip(page ? page * 10 : 0)
      .sort(safeSort.length > 0 ? [safeSort] : []);

    res.render(path.join(__dirname+'//..//views//index.ejs'), { data, total, page: req.query.page });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.get('/airbnb/create', (req , res) => {
  res.render(path.join(__dirname+'//..//views//edit.ejs'), { data: {} });
});

router.get('/airbnb/:id', validateId, handleValidationErrors, (req , res) => {
  airbnbModel.findOne({ id: req.params.id }).then(data => {
    if (!data) {
      return res.status(404).json({ error: 'Élément non trouvé' });
    }
    res.render(path.join(__dirname+'//..//views//details.ejs'), { data });
  });
});

router.get('/airbnb/:id/edit', validateId, handleValidationErrors, (req , res) => {
  airbnbModel.findOne({ id: req.params.id }).then(data => {
    if (!data) {
      return res.status(404).json({ error: 'Élément non trouvé' });
    }
    res.render(path.join(__dirname+'//..//views//edit.ejs'), { data });
  });
});

router.get('/airbnb/:id/delete', validateId, handleValidationErrors, (req , res) => {
  airbnbModel.deleteOne({ id: req.params.id }).then(() => {
    airbnbModel.findOne({}).then(data => {
      res.redirect('/')
    });
  })
});

// Sanitize body to prevent NoSQL injection
const sanitizeBody = (body) => {
  const sanitized = {};
  for (const field of ALLOWED_UPDATE_FIELDS) {
    if (field in body) {
      sanitized[field] = typeof body[field] === 'string' ? body[field].trim() : body[field];
    }
  }
  return sanitized;
};

router.post('/airbnb/:id/validate', validateId, handleValidationErrors, (req , res) => {
  const sanitizedBody = sanitizeBody(req.body);
  airbnbModel.updateOne({ id: req.params.id }, sanitizedBody).then(() => {
    res.redirect('/')
  });
});

router.post('/airbnb/validate', (req , res) => {
  const sanitizedBody = sanitizeBody(req.body);
  const id = req.body.id;
  if (!id) {
    return res.status(400).json({ error: 'ID requis dans le corps de la requête' });
  }
  airbnbModel.findOneAndUpdate({ id }, sanitizedBody, { upsert: true }).then(() => {
    res.redirect('/')
  });
});

module.exports = router;
