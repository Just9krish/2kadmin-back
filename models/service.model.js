const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
  {
    vehicleNo: {
      type: String,
      required: true,
    },
    garage: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    note: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Service', serviceSchema);
