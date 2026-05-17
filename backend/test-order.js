require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('./models/Order');
const Product = require('./models/Product');
const User = require('./models/User');
const WalletTransaction = require('./models/WalletTransaction');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const user = await User.findOne({}).lean();
  const product = await Product.findOne({}).lean();

  const order = new Order({
    user: user._id,
    items: [{ product: product._id, quantity: 1, price: product.finalPrice }],
    totalAmount: product.finalPrice,
    shippingAddress: { name: 'Test', phone: '9999999999', address: '123 St', city: 'Delhi', pincode: '110001' },
    paymentMethod: 'cod'
  });

  try {
    await order.save();
    console.log('1. order.save() OK');

    await order.populate('items.product', 'name images');
    console.log('2. populate OK');

    const freshUser = await User.findById(user._id);
    console.log('3. freshUser OK, isFirstOrderCompleted:', freshUser.isFirstOrderCompleted);

    if (!freshUser.isFirstOrderCompleted) {
      const cashback = Math.round(product.finalPrice * 0.4);
      await User.findByIdAndUpdate(user._id, { $inc: { walletBalance: cashback } });
      console.log('4. wallet update OK');
      await WalletTransaction.create({
        user: user._id, type: 'cashback', amount: cashback,
        description: 'test cashback', relatedOrder: order._id
      });
      console.log('5. WalletTransaction.create OK');
      await User.findByIdAndUpdate(user._id, { isFirstOrderCompleted: true });
      console.log('6. isFirstOrderCompleted update OK');
    }

    await Order.findByIdAndDelete(order._id);
    await WalletTransaction.deleteMany({ relatedOrder: order._id });
    await User.findByIdAndUpdate(user._id, { $inc: { walletBalance: -Math.round(product.finalPrice * 0.4) }, isFirstOrderCompleted: false });
    console.log('ALL STEPS PASSED');
  } catch(e) {
    console.error('FAILED at step - Error:', e.message);
    if (e.errors) console.error('Fields:', JSON.stringify(e.errors));
  }
  mongoose.disconnect();
}).catch(e => console.error('Connect error:', e.message));
