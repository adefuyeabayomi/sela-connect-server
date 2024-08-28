const DeliveryOrder = require('../models/delivery_order.model');
const { zonesData, determineZone } = require('../utils/zoneData');
const axios = require('axios')
const config = require("../utils/config")
const monnifyUtils = require('../utils/monnify.utils')
const logger = require('../utils/logger')

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
  const { page = 1, limit = 30, user, status } = req.query;
  const skip = (page - 1) * limit;
  let query = {}
  if(user){
    query.email = user
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
    const { deliveryTrackStatus } = req.query;

    // Filter by pending and dropped orders only
    const query = {
      deliveryTrackStatus: { $in: deliveryTrackStatus }
    };

    // Fetch matching delivery orders
    const deliveryOrders = await DeliveryOrder.find(query).lean();
    console.log({deliveryOrders})

    // Calculate the total number of pending deliveries
    const pendingTotal = deliveryOrders.filter(order => order.deliveryTrackStatus === 'pending').length;

    // Get today's date in ISO format (ignore time)
    const today = new Date().toISOString().split('T')[0];

    // Calculate the total number of deliveries scheduled for today
    const todayDeliveries = deliveryOrders.filter(order =>
      order.isSchedule && new Date(order.scheduleOptions.date).toISOString().split('T')[0] === today
    ).length;

    // Calculate the number of deliveries scheduled for other days
    const otherDays = deliveryOrders
      .filter(order =>
        order.isSchedule && new Date(order.scheduleOptions.date).toISOString().split('T')[0] !== today
      )
      .reduce((acc, order) => {
        const scheduledDate = new Date(order.scheduleOptions.date).toISOString().split('T')[0];
        const existingEntry = acc.find(entry => entry.date === scheduledDate);

        if (existingEntry) {
          existingEntry.total += 1;
        } else {
          acc.push({ date: scheduledDate, total: 1 });
        }

        return acc;
      }, []);

    return res.status(200).json({
      pendingTotal,
      today: todayDeliveries,
      otherDays
    });
  } catch (error) {
    console.error('Error fetching sorted delivery orders:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createDeliveryOrder,
  updateDeliveryOrderById,
  getDeliveryOrders,
  getDeliveryOrderById,
  calculateDeliveryCost,
  confirmPayment,
  getSortedDeliveryOrders
};
