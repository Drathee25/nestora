const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const {
  listProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
} = require('../controllers/propertyController');

const router = express.Router();

router.get('/', listProperties);
router.get('/:id', getProperty);
router.post('/', authMiddleware, createProperty);
router.put('/:id', authMiddleware, updateProperty);
router.delete('/:id', authMiddleware, deleteProperty);

module.exports = router;
