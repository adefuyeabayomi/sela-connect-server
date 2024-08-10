const DeliveryOrder = require('../models/delivery_order.model');

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

module.exports = {
  createDeliveryOrder,
  updateDeliveryOrderById,
  getDeliveryOrders,
  getDeliveryOrderById
};
