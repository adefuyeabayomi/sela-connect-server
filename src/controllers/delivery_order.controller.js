const DeliveryOrder = require('../models/delivery_order.model');
const Auth = requite('../models/auth.model')
const { zonesData, determineZone } = require('../utils/zoneData');
const axios = require('axios')
const config = require("../utils/config")
const monnifyUtils = require('../utils/monnify.utils')
const logger = require('../utils/logger')
const moment = require('moment')

// Create a new delivery order
const createDeliveryOrder = async (req, res) => {
  console.log(req.body)
  try {
    const newOrder = new DeliveryOrder(req.body);
    await newOrder.save();
    return res.status(201).json(newOrder);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Update a delivery order by ID
const updateDeliveryOrderById = async (req, res) => {
  const { id } = req.params;
  console.log('requestbody',id, req.body)
  try {
    const deliveryOrder = await DeliveryOrder.findById(id);
    console.log({deliveryOrder})
    if (!deliveryOrder) {
      return res.status(404).json({ message: 'Delivery order not found' });
    }

    // Update fields from the request body
    Object.keys(req.body).forEach((key) => {
      if (!!req.body[key]) {
        deliveryOrder[key] = req.body[key];
      }
    });

    await deliveryOrder.save();
    return res.status(200).json(deliveryOrder);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Get delivery orders with pagination
const getDeliveryOrders = async (req, res) => {
  const { page = 1, limit = 30, user, status, rider } = req.query;
  const skip = (page - 1) * limit;
  let query = {}
  if(user){
    query.email = user
  }
  if(rider){
    let riderData = await Auth.findOne({email: rider})
    query.assignedRider = riderData._id
  }
  if(status){
    query.deliveryTrackStatus = status
  }

  try {
    const orders = await DeliveryOrder.find(query)
      .skip(skip)
      .limit(Number(limit))
      .exec();
    return res.status(200).json(orders);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};
const getOrdersByIds = async (req, res) => {
  const { ids } = req.body; // Array of IDs passed in the request body

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: 'Invalid or missing IDs array' });
  }

  try {
    // Fetch orders by IDs
    const orders = await DeliveryOrder.find({ _id: { $in: ids } });

    // Return the fetched orders
    return res.status(200).json(orders);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};
// Get a delivery order by ID
const getDeliveryOrderById = async (req, res) => {
  const { id } = req.params;
  
  try {
    const deliveryOrder = await DeliveryOrder.findById(id);
    if (!deliveryOrder) {
      return res.status(404).json({ message: 'Delivery order not found' });
    }
    return res.status(200).json(deliveryOrder);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const calculateDeliveryCost = (req, res) => {
  const { pickupArea, dropoffArea, type } = req.body;

  // Validate the input
  if (!pickupArea || !dropoffArea || !type) {
    return res.status(400).json({ error: 'Please provide pickupArea, dropoffArea, and type.' });
  }

  // Check if the type is valid
  const validTypes = ['bulk', 'regular', 'express'];
  if (!validTypes.includes(type)) {
    return res.status(400).json({ error: 'Invalid type. Must be bulk, regular, or express.' });
  }

  // Find the pricing data for the pickup and dropoff areas
  const pickupZone = determineZone(pickupArea);
  const dropoffZone = determineZone(dropoffArea)

  if (!pickupZone) {
    return res.status(404).json({ error: 'Pickup area not found.' });
  }

  if (!dropoffZone) {
    return res.status(404).json({ error: 'Dropoff area not found.' });
  }

  // Return the price for the selected type
  console.log({pickupZone, dropoffZone})
  const price = zonesData[pickupZone][dropoffZone][type];
  console.log(price)
  return res.json({ cost: price });
};

const confirmPayment = async (req, res) => {
  const { id, paymentReference, transactionReference } = req.body;
  console.log({body: req.body})
  // get auth token here.
  let token = await monnifyUtils.generateMonnifyAccessToken()
  console.log({token})
  try { 
    // Fetch the delivery order by ID
    const deliveryOrder = await DeliveryOrder.findById(id);
    if (!deliveryOrder) {
      return res.status(404).json({ message: 'Delivery order not found' });
    }
    const encodedTransactionReference = encodeURIComponent(transactionReference);
    console.log({encodedTransactionReference})
    // Call the Monnify API to verify the transaction
    const monnifyResponse = await axios.get(`${config.monnifyBaseUrl}/api/v2/transactions/${encodedTransactionReference}`, {
      headers: {
        Authorization: `Bearer ${token}`, // Assuming Monnify requires an API key in the headers
      },
    });

    const { requestSuccessful, responseBody } = monnifyResponse.data;
    
    if (!requestSuccessful) {
      return res.status(400).json({ message: 'Transaction verification failed' })
    }

    console.log({ requestSuccessful, responseBody })
    const { amountPaid, paymentStatus, paymentReference } = responseBody;
    const bool = Number(amountPaid) !== Number(deliveryOrder.price)
    console.log({ amountPaid, orderPrice: deliveryOrder.price, paymentStatus, paymentReference, bool })

    // Cross-reference the amount
    if (bool) {
      return res.status(400).json({ message: 'Payment amount does not match the order amount' });
    }

    // Update the delivery order with payment details if payment is successful
    if (paymentStatus === 'PAID') {
      deliveryOrder.paymentReference = paymentReference;
      deliveryOrder.transactionReference = transactionReference;
      deliveryOrder.paymentStatus = 'paid';

      await deliveryOrder.save();
      return res.status(200).json(deliveryOrder);
    } else {
      return res.status(400).json({ message: 'Payment not successful' });
    }
  } catch (error) {
    logger.errorLogger(error)
    return res.status(500).json({ message: 'Server error', error });
  }
};

const getSortedDeliveryOrders = async (req, res) => {
  try {
    const { deliveryTrackStatus, rider } = req.query;
    let query = {}
    if (!['pending', 'dropped'].includes(deliveryTrackStatus)) {
      return res.status(400).json({ error: 'Invalid deliveryTrackStatus value' });
    }
    if(deliveryTrackStatus !== undefined){
      query.deliveryTrackStatus = deliveryTrackStatus
    }
    if(rider !== undefined){
      query.assignedRider = rider;
    }
    // Fetch all matching delivery orders
    const deliveryOrders = await DeliveryOrder.find(query);

    let pendingTotal = 0;
    const deliveriesByDay = {};

    deliveryOrders.forEach((order,index) => {
      // Increase pending count
      if (order.deliveryTrackStatus === 'pending') {
        pendingTotal += 1;
      }

      // Determine the relevant date (schedule date or creation date)
      const relevantDate = order.isSchedule
        ? moment(order.scheduleOptions.date).startOf('day').format('YYYY-MM-DD')
        : moment(order.createdAt).startOf('day').format('YYYY-MM-DD');

      // Group orders by the relevant date
      if (!deliveriesByDay[relevantDate]) {
        deliveriesByDay[relevantDate] = {
          date: relevantDate,
          total: 0,
          deliveryIds: []
        };
      }

      deliveriesByDay[relevantDate].total += 1;
      deliveriesByDay[relevantDate].deliveryIds.push(order._id);
    });

    const sortedResponse = {
      pendingTotal,
      deliveriesByDay: Object.values(deliveriesByDay)
    };

    return res.status(200).json(sortedResponse);
  } catch (error) {
    console.error('Error sorting deliveries:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createDeliveryOrder,
  updateDeliveryOrderById,
  getDeliveryOrders,
  getDeliveryOrderById,
  calculateDeliveryCost,
  confirmPayment,
  getSortedDeliveryOrders,
  getOrdersByIds
};
