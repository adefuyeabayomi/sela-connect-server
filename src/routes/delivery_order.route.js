const express = require('express');
const router = express.Router();
const {
  createDeliveryOrder,
  updateDeliveryOrderById,
  getDeliveryOrders,
  getDeliveryOrderById,
  calculateDeliveryCost,
  confirmPayment,
  getSortedDeliveryOrders,
  getOrdersByIds
} = require('../controllers/delivery_order.controller');

const verifyToken = require('../functions/verifyToken.middleware'); 

// Route to create a delivery order
router.post('/', verifyToken, createDeliveryOrder);

router.get('/sorted', getSortedDeliveryOrders);

// Route to update a delivery order by ID
router.put('/:id', verifyToken, updateDeliveryOrderById);

// Route to get all delivery orders with pagination
router.get('/', getDeliveryOrders);

// Route to get a delivery order by ID
router.get('/:id', getDeliveryOrderById);

// Route to calculate the delivery cost
router.post('/calculate-delivery-cost', calculateDeliveryCost);

// Route to confirm payment
router.post('/confirm-payment',confirmPayment);

// Define the new endpoint for fetching delivery orders by IDs
router.post('/orders-by-ids', getOrdersByIds);

module.exports = router;

