const mongoose = require('mongoose');

const fuelSchema = new mongoose.Schema(
  {
    vehicleNo: {
      type: String,
      required: true,
    },
    pumpLocation: {
      type: String,
      required: true,
    },
    liters: {
      type: Number,
      required: true,
    },
    rate: {
      type: Number,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Fuel', fuelSchema);
