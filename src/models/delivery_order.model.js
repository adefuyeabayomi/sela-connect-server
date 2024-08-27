const mongoose = require('mongoose');
const { Schema } = mongoose;

const deliveryOrderSchema = new Schema({
  packageDescription: {
    type: String
  },
  packageWeight: {
    type: Number
  },
  perishables: {
    type: Boolean
  },
  fragile: {
    type: Boolean
  },
  pickupIsResidential: {
    type: Boolean
  },
  dropoffIsResidential: { // corrected typo from dropoffIsRedential
    type: Boolean
  },
  pickupRestrictions: {
    type: String
  },
  dropoffRestrictions: {
    type: String
  },
  senderName: {
    type: String,
    required: true
  },
  senderPhoneNo: {
    type: String,
    required: true
  },
  receiverName: {
    type: String,
    required: true
  },
  receiverPhoneNo: {
    type: String,
    required: true
  },
  pickupAddress: {
    type: String,
    required: true
  },
  dropoffAddress: {
    type: String,
    required: true
  },
  pickupArea: {
    type: String,
    required: true
  },
  dropoffArea: {
    type: String,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['online', 'ondelivery', 'onpickup'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid']
  },
  price: {
    type: Number,
    required: true
  },
  totalDistance: {
    type: Number,
    default : 0
  },
  user: {
    type: Schema.Types.String,
    ref: 'Auth' // assuming there is a User model
  },
  email: {
    type: String,
    default: ''
  },
  deliveryId: {
    type: String,
    required: true,
    unique: true
  },
  deliveryType: {
    type: String,
    required: true,
    enum: ['regular', 'bulk', 'express']
  },
  vendor: {
    type: Boolean,
    default: false
  },
  assignedRider: {
    type: String,
    default: ''
  },
  deliveryTrackStatus: {
    type: String,
    default: 'pending',
    enum: ['pending', 'started', 'picked', 'dropped']
  },
  // Additional properties as per comments
  isExpress: {
    type: Boolean,
    default: false
  },
  isBulk: {
    type: Boolean,
    default: false
  },
  bulkOptions: {
    type: Object, // can be replaced with a more specific schema if needed
    default: {}
  },
  isSchedule: {
    type: Boolean,
    default: false
  },
  scheduleOptions: {
    type: Object, // can be replaced with a more specific schema if needed
    default: {}
  },
  costData: {
    type: Object, // can be replaced with a more specific schema if needed
    default: {}
  },
  locationData: {
    type: Object, // can be replaced with a more specific schema if needed
    default: {}
  },
  paymentReference: {
    type: String,
    default: ''
  },
  transactionReference: {
    type: String,
    default: ''
  }
}, {
  timestamps: true // adds createdAt and updatedAt fields
});

const DeliveryOrder = mongoose.model('DeliveryOrder', deliveryOrderSchema);

module.exports = DeliveryOrder;
