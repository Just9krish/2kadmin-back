const express = require('express');
const transactionModel = require('../models/transaction.model');
const userModel = require('../models/user.model');

const sampleUsers = require('../data/user.json');
const transactionSampleData = require('../data/transaction.json');

const router = express.Router();

const getRandomItem = (array) => {
  return array[Math.floor(Math.random() * array.length)];
};

router.post('/seed-users-and-transactions', async (req, res) => {
  try {
    // Step 1: Seed users (customers and suppliers)
    for (const user of sampleUsers) {
      try {
        // Check if the user with the same number already exists
        const existingUser = await userModel.findOne({ number: user.number });
        if (!existingUser) {
          // Insert the new user only if they don't already exist
          await userModel.create(user);
          console.log(`User ${user.name} created successfully`);
        } else {
          console.log(
            `User with number ${user.number} already exists, skipping creation`
          );
        }
      } catch (error) {
        console.error(`Error inserting user ${user.name}:`, error);
      }
    }

    // Step 2: Fetch all customers and suppliers
    const customers = await userModel.find({ type: 'customer' });
    const suppliers = await userModel.find({ type: 'supplier' });

    if (customers.length === 0 || suppliers.length === 0) {
      return res
        .status(400)
        .json({ message: 'No customers or suppliers found in the database' });
    }

    // Step 3: Create transactions for each customer and supplier
    const transactionPromises = [];

    // Create SELL transactions for customers
    for (const customer of customers) {
      const randomTransactionData = getRandomItem(transactionSampleData);

      const transaction = new transactionModel({
        transactionType: 'SELL',
        customer: customer._id,
        supplier: null,
        material: randomTransactionData.material,
        quantity: randomTransactionData.quantity,
        rate: randomTransactionData.rate,
        passNumber: randomTransactionData.passNumber,
        vehicleNumber: randomTransactionData.vehicleNumber,
        location: randomTransactionData.location,
        amountPaid: randomTransactionData.amountPaid,
        pendingAmount: randomTransactionData.pendingAmount,
        totalAmount: randomTransactionData.totalAmount,
      });

      transactionPromises.push(transaction.save());

      // Update pending amount for the customer
      await userModel.findByIdAndUpdate(customer._id, {
        $inc: { pending: randomTransactionData.pendingAmount },
      });
    }

    // Create BUY transactions for suppliers
    for (const supplier of suppliers) {
      const randomTransactionData = getRandomItem(transactionSampleData);

      const transaction = new transactionModel({
        transactionType: 'BUY',
        customer: null,
        supplier: supplier._id,
        crusherNo: `CRUSH${Math.floor(Math.random() * 1000)}`,
        material: randomTransactionData.material,
        quantity: randomTransactionData.quantity,
        rate: randomTransactionData.rate,
        passNumber: randomTransactionData.passNumber,
        vehicleNumber: randomTransactionData.vehicleNumber,
        location: randomTransactionData.location,
        amountPaid: randomTransactionData.amountPaid,
        pendingAmount: randomTransactionData.pendingAmount,
        totalAmount: randomTransactionData.totalAmount,
      });

      transactionPromises.push(transaction.save());

      // Update pending amount for the supplier
      await userModel.findByIdAndUpdate(supplier._id, {
        $inc: { pending: randomTransactionData.pendingAmount },
      });
    }

    // Wait for all transactions to be saved
    await Promise.all(transactionPromises);
    console.log('Transactions seeded successfully');

    res
      .status(200)
      .json({ message: 'Users and transactions seeded successfully' });
  } catch (error) {
    console.error('Error seeding data:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
