const mongoose = require('mongoose');

const paymentLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    paymentMode: {
      enum: ['CASH', 'CHEQUE'],
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('PaymentLog', paymentLogSchema);
