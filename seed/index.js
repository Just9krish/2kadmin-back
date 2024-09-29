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

    // Step 3: Create random transactions using the fetched users
    const transactionPromises = [];

    for (let i = 0; i < 5; i++) {
      let selectedUser, transactionType;

      if (Math.random() < 0.5) {
        // Select a random customer and set transaction type to "SELL"
        selectedUser = getRandomItem(customers);
        transactionType = 'SELL';
      } else {
        // Select a random supplier and set transaction type to "BUY"
        selectedUser = getRandomItem(suppliers);
        transactionType = 'BUY';
      }

      // Randomly select transaction data from the sample
      const randomTransactionData = getRandomItem(transactionSampleData);

      // Create the transaction object
      const transaction = new transactionModel({
        transactionType,
        customer: transactionType === 'SELL' ? selectedUser._id : null,
        supplier: transactionType === 'BUY' ? selectedUser._id : null,
        crusherNo:
          transactionType === 'BUY'
            ? `CRUSH${Math.floor(Math.random() * 1000)}`
            : null,
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

      if (transactionType === 'SELL') {
        // Update pending amount for customer
        await userModel.findByIdAndUpdate(selectedUser._id, {
          $inc: { pending: randomTransactionData.pendingAmount },
        });
      } else if (transactionType === 'BUY') {
        // Update pending amount for supplier
        await userModel.findByIdAndUpdate(selectedUser._id, {
          $inc: { pending: randomTransactionData.pendingAmount },
        });
      }
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
