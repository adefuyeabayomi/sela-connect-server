const DeliveryOrder = require('../models/delivery_order.model');
const { zonesData, determineZone } = require('../utils/zoneData');

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
    const deliveryOrder = await DeliveryOrder.findOne({deliveryId: id});
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
  const { page = 1, limit = 30 } = req.query;
  const skip = (page - 1) * limit;

  try {
    const orders = await DeliveryOrder.find()
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

module.exports = {
  createDeliveryOrder,
  updateDeliveryOrderById,
  getDeliveryOrders,
  getDeliveryOrderById,
  calculateDeliveryCost
};
