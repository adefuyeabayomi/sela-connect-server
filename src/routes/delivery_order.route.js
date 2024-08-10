const express = require('express');
const router = express.Router();
const {
  createDeliveryOrder,
  updateDeliveryOrderById,
  getDeliveryOrders,
  getDeliveryOrderById
} = require('../controllers/delivery_order.controller');
const verifyToken = require('../functions/verifyToken.middleware'); // Assuming this middleware is used for authentication

// Route to create a delivery order
router.post('/', verifyToken, createDeliveryOrder);

// Route to update a delivery order by ID
router.put('/:id', verifyToken, updateDeliveryOrderById);

// Route to get all delivery orders with pagination
router.get('/', getDeliveryOrders);

// Route to get a delivery order by ID
router.get('/:id', getDeliveryOrderById);

module.exports = router;

