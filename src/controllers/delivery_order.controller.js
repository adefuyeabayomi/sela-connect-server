const DeliveryOrder = require('../models/delivery_order.model');
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

const getSortedDeliveryOrders1 = async (req, res) => {
  try {
    const { deliveryTrackStatus } = req.query;

    // Filter by pending and dropped orders only
    const query = {
      deliveryTrackStatus: { $in: deliveryTrackStatus }
    };

    // Fetch matching delivery orders
    const deliveryOrders = await DeliveryOrder.find(query).lean();

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
const getSortedDeliveryOrders2 = async (req, res) => {
  const { deliveryTrackStatus } = req.query;

  try {
    // Fetch pending and dropped delivery orders based on deliveryTrackStatus
    const orders = await DeliveryOrder.find({
      deliveryTrackStatus: { $in: ['pending', 'dropped'] }
    }).exec();

    const today = moment().startOf('day'); // Start of today (00:00:00)
    const todayEnd = moment().endOf('day'); // End of today (23:59:59)

    let pendingTotal = 0;
    let todayCount = 0;
    const otherDaysMap = new Map();

    orders.forEach(order => {
      if (!order || !order.createdAt) return; // Ensure order and createdAt exist

      const scheduleDate = order.isSchedule && order.scheduleOptions && order.scheduleOptions.date
        ? moment(order.scheduleOptions.date)
        : null;

      const isScheduledForToday = scheduleDate && scheduleDate.isBetween(today, todayEnd, null, '[]');
      const isToday = !order.isSchedule && moment(order.createdAt).isBetween(today, todayEnd, null, '[]');

      if (order.deliveryTrackStatus === 'pending') {
        pendingTotal += 1;
      }

      if (isScheduledForToday || isToday) {
        todayCount += 1;
      } else if (scheduleDate) {
        const dateStr = scheduleDate.format('YYYY-MM-DD');
        otherDaysMap.set(dateStr, (otherDaysMap.get(dateStr) || 0) + 1);
      }
    });

    const otherDaysArray = Array.from(otherDaysMap, ([date, total]) => ({ date, total }));

    return res.status(200).json({
      pendingTotal,
      today: todayCount,
      otherDays: otherDaysArray,
    });
  } catch (error) {
    console.error("Error in getSortedDeliveryOrders:", error);
    return res.status(500).json({ message: 'Server error' });
  }
};
const getSortedDeliveryOrders3 = async (req, res) => {

  const { deliveryTrackStatus } = req.query;
  try {
    // Fetch pending and dropped delivery orders
    const orders = await DeliveryOrder.find({
      deliveryTrackStatus: { $in: deliveryTrackStatus }
    }).exec();

    const today = moment().startOf('day'); // Start of today (00:00:00)
    const todayEnd = moment().endOf('day'); // End of today (23:59:59)

    let pendingTotal = 0;
    let todayCount = 0;
    const todayDeliveries = [];
    const otherDaysMap = new Map();

    orders.forEach(order => {
      if (!order || !order.createdAt) return; // Ensure order and createdAt exist

      const scheduleDate = order.isSchedule && order.scheduleOptions && order.scheduleOptions.date
        ? moment(order.scheduleOptions.date)
        : null;

      const isScheduledForToday = scheduleDate && scheduleDate.isBetween(today, todayEnd, null, '[]');
      const isToday = !order.isSchedule && moment(order.createdAt).isBetween(today, todayEnd, null, '[]');

      if (order.deliveryTrackStatus === 'pending') {
        pendingTotal += 1;
      }

      if (isScheduledForToday || isToday) {
        todayCount += 1;
        todayDeliveries.push(order._id); // Add order ID to todayDeliveries
      } else if (scheduleDate) {
        const dateStr = scheduleDate.format('YYYY-MM-DD');
        if (!otherDaysMap.has(dateStr)) {
          otherDaysMap.set(dateStr, { total: 0, ids: [] });
        }
        const dayData = otherDaysMap.get(dateStr);
        dayData.total += 1;
        dayData.ids.push(order._id);
      }
    });

    const otherDaysArray = Array.from(otherDaysMap, ([date, data]) => ({
      date,
      total: data.total,
      ids: data.ids,
    }));

    return res.status(200).json({
      pendingTotal,
      today: todayCount,
      todayDeliveries, // Array of IDs for today's deliveries
      otherDays: otherDaysArray,
    });
  } catch (error) {
    console.error("Error in getSortedDeliveryOrders:", error);
    return res.status(500).json({ message: 'Server error' });
  }
};
const getSortedDeliveryOrders = async (req, res) => {
  try {
    const { deliveryTrackStatus } = req.query;

    if (!['pending', 'dropped'].includes(deliveryTrackStatus)) {
      return res.status(400).json({ error: 'Invalid deliveryTrackStatus value' });
    }

    // Fetch all matching delivery orders
    const deliveryOrders = await DeliveryOrder.find({ deliveryTrackStatus });

    let pendingTotal = 0;
    let todayTotal = 0;
    const todayDeliveries = [];
    const otherDays = {};
    const today = moment().startOf('day');

    deliveryOrders.forEach((order) => {
      // Increase pending count
      if (order.deliveryTrackStatus === 'pending') {
        pendingTotal += 1;
      }

      // Check if the order is scheduled for today or is not scheduled but created today
      const isToday =
        order.isSchedule && moment(order.scheduleOptions.date).isSame(today, 'day') ||
        !order.isSchedule && moment(order.createdAt).isSame(today, 'day');

      if (isToday) {
        todayTotal += 1;
        todayDeliveries.push(order._id);
      } else if (order.isSchedule) {
        const orderDate = moment(order.scheduleOptions.date).startOf('day').format('YYYY-MM-DD');
        if (!otherDays[orderDate]) {
          otherDays[orderDate] = {
            date: orderDate,
            total: 0,
            deliveryIds: []
          };
        }
        otherDays[orderDate].total += 1;
        otherDays[orderDate].deliveryIds.push(order._id);
      }
    });

    const otherDaysArray = Object.values(otherDays);

    const sortedResponse = {
      pendingTotal,
      today: {
        total: todayTotal,
        deliveryIds: todayDeliveries
      },
      otherDays: otherDaysArray
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
