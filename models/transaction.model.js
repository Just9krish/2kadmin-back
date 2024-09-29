const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    transactionType: {
      type: String,
      enum: ['BUY', 'SELL'], // Can either be "BUY" or "SELL"
      required: true,
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // supplier reference
      required: function () {
        return this.customer === null; // Required only if it's a buy transaction
      },
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // customer reference
      required: function () {
        return this.supplier === null; // Required only if it's a sell transaction
      },
    },
    crusherNo: {
      type: String,
      required: function () {
        return this.transactionType === 'BUY'; // Crusher number required only for buy transactions
      },
    },
    material: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    rate: {
      type: Number,
      required: true,
    },
    passNumber: {
      type: String,
      required: true,
    },
    vehicleNumber: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    amountPaid: {
      type: Number,
      default: 0,
    },
    pendingAmount: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Transaction', transactionSchema);
