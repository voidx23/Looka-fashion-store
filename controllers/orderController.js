const Order = require("../models/orderSchema")
const Wallet = require("../models/walletSchema")
const Cart = require("../models/shoppingCartSchema");
const mongoose = require('mongoose');
const User = require("../models/userSchema");
const ObjectId = mongoose.Types.ObjectId;
const Address = require("../models/addressSchema");
const Product = require("../models/productSchema");
const PDFDocument = require("pdfkit");
const fs = require("fs");



//admin
exports.OrdersAdmin = async (req, res) => {

  let userId = req.session.user;
  try {
    let orders = await Order.find()
      .populate({
        path: 'userId',
        model: 'User',
        select: 'name email' // select the fields you want to include from the User document
      })
      .populate({
        path: 'products.item',
        model: 'Product'
      })
      .exec();


    res.locals.orders = orders;

    console.log(orders, "all orders");


    res.render("admin/orderStatus", { noShow: true });
  } catch (error) {
    console.log(error);
  }
};
//deatil of order shown in admin page
exports.orderDetailsAdmin = async (req, res) => {
  console.log(req.body, '🥶🥶🥶🥶 ')

  let productId = req.query.productId
  let orderId = req.query.orderId;
  console.log(productId, "proId")
  console.log(orderId, "ordId")
  const deliveryStatus = req.body.deliveryStatus;
  console.log(deliveryStatus)

  let orders = await Order.find({ _id: orderId })
    .populate({
      path: 'products.item',
      model: 'Product'
    }).exec();

  console.log(orders, "ord")

  let product = null;
  for (let i = 0; i < orders.length; i++) {
    let order = orders[i];
    product = order.products.find(product => product.item._id.toString() === productId);
    console.log(product, "products found")
    if (product) {
      if (deliveryStatus == 'cancelled') {
        product.orderstatus = "cancelled";
        product.deliverystatus = "cancelled";
      }
      if (deliveryStatus == 'delivered') {
        console.log("status delivered ❤️❤️❤️❤️❤️❤️❤️❤️❤️");

        product.deliverystatus = "delivered";
        product.orderstatus = "delivered";

        let orderUpdate = await Order.updateOne(
          { _id: orderId },
          {
            $set: {
              deliveryDate: new Date(),
              deliverystatus: "delivered",
              paymentstatus: "Paid",
              reason: "",
              returnstatus: "",

            }
          }
        );
        console.log(orderUpdate + "😍😍😍😍😍😍");

      }
      if (deliveryStatus == "shipped") {
        product.deliverystatus = "shipped";
        product.orderstatus = "shipped";

        let orderUpdate = await Order.updateOne(
          { _id: orderId },
          {
            $set: {
              deliveryDate: new Date(),
              deliverystatus: "shipped",
              reason: "",
              returnstatus: "",
            }
          }
        );
      }

      if (deliveryStatus == "out for delivery") {
        product.deliverystatus = "out for delivery";
        product.orderstatus = "out for delivery";

        let orderUpdate = await Order.updateOne(
          { _id: orderId },
          {
            $set: {
              deliveryDate: new Date(),
              deliverystatus: "out for delivery",
              reason: "",
              returnstatus: "",
            }
          }
        );
      }
      if (product.deliverystatus == 'waiting for return confirmation') {
        product.orderstatus = 'returned';
        product.deliverystatus = 'returned';
        console.log("status returned 😊😊");
        let orderUpdate = await Order.updateOne(
          { _id: orderId },
          {
            $set: {
              returnDate: new Date(),
              returnstatus: "returned",
              deliverystatus: "returned",
              paymentstatus: "Refund completed"


            }
          }
        );
        let wallet = await Wallet.findOne({ userId: order.userId });

        if (!wallet) {

          wallet = new Wallet({
            userId: order.userId,
            balance: 0,
            updateAt: Date.now(),
          })

        }

        let price = order.totalAmount;
        wallet.balance += price;
        await wallet.save();

        console.log(orderUpdate + "😍😍😍😍😍😍");

      }
      await order.save();
      break; // Exit the loop once product is found
    }


  }

  res.redirect('/admin/orderStatus')
}


//user side order return request handling function

exports.returnUpadtion = async (req, res) => {
  console.log(req.body, 'selected ')

  let productId = req.query.productId
  let orderId = req.query.orderId;
  let reason = req.query.reason;
  let userId = req.session.user

  const deliveryStatus = req.body.deliveryStatus;


  let orders = await Order.find({ _id: orderId })
    .populate({
      path: 'products.item',
      model: 'Product'
    }).exec();



  let product = null;
  for (let i = 0; i < orders.length; i++) {
    let order = orders[i];

    product = order.products.find(product => product.item._id.toString() === productId);
    console.log(product, "products found")
    if (product) {

      if (product.deliverystatus == 'delivered') {
        product.deliverystatus = "waiting for return confirmation"
        console.log("status delivered ❤️❤️❤️❤️❤️❤️❤️❤️❤️");
        let orderUpdate = await Order.updateOne(
          { _id: orderId },
          {
            $set: {
              deliveryDate: new Date(),
              deliverystatus: " waiting for return confirmation",
              reason: reason,
            }
          }
        );


        console.log(orderUpdate, "😍😍😍😍😍😍");


      }
      await order.save();
      break; // Exit the loop once product is found
    }


  }

  res.redirect('/myorders')
}
//admin side orders ends




exports.getOrderStatus = async (req, res) => {
  try {
    let user = req.session.user
    const username = user.name

    const orders = await Order.find({ userId: req.session.user._id })

      .sort("-updatedAt")
      .populate({
        path: "products.item",
        model: "Product",
      })
      .exec();

    const cartCount = req.cartCount;



    if (orders.length === 0) {

      return res.render('user/emptyOrderStatus', {
        username,
        cartCount,
        userloggedIn: req.session.userloggedIn,



      })

    }
    var deliveryDate = new Date(orders[0].deliveryDate);
    console.log(deliveryDate, "👌👌👌👌👌");
    var currentDate = new Date();
    var timeDiff = Math.abs(currentDate.getTime() - deliveryDate.getTime());
    console.log(timeDiff, "🙌🙌🙌🙌🙌");
    var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
    console.log(diffDays, "🤣🤣🤣🤣🤣");


    console.log(orders, "ordersssss");
    // res.locals.orders=orders
    //   const userId = req.session.user._id;
    //   // console.log(userId,"lksdfjglkjdlsafkjglkaj")
    //   let orders = await Order.find({ userId: userId });
    //   // console.log(orders)
    // Access cartCount value from req object

    if (req.session.filterOrders) {
      console.log("filterOrders");
      res.locals.orders = req.session.filterOrders;
      req.session.filterOrders = null;
    } else if (req.session.noOrders) {
      console.log("noOrders");
      res.locals.orders = req.session.noOrders;
      req.session.noOrders = null;
    } else if (req.session.cancelledOrders) {
      console.log("cancelledOrders");
      res.locals.orders = req.session.cancelledOrders;
      req.session.cancelledOrders = null;
    } else if (req.session.notShippedOrders) {
      console.log("notShippedOrders");
      res.locals.orders = req.session.notShippedOrders;
      req.session.notShippedOrders = null;
    } else if (req.session.returneddOrders) {
      console.log("returneddOrders");
      res.locals.orders = req.session.returneddOrders;
      req.session.returneddOrders = null;
    } else {
      console.log("orders");
      res.locals.orders = orders;

    }

    console.log(cartCount, "cart count");
    res.render("user/myOrders", {

      cartCount,
      username,
      userloggedIn: req.session.userloggedIn,
      diffDays

    });
  }
  catch (error) {
    console.log(error);
  }


}





exports.viewOrderProducts = async (req, res) => {
  let user = req.session.user
  let order = req.params.id
  let cond = new ObjectId(order)

  try {


    // Fetch the cart items
    let cartItems = await Order.aggregate([
      {
        $match: { _id: cond },
      },

      {
        $lookup: {
          from: "products",
          localField: 'products.item',
          foreignField: "_id",
          as: "productInfo",
        },
      }

    ]);

    console.log(cartItems[0].products, "💥💥💥")
    console.log(cartItems[0].productInfo, "hgjhgjhgjhgjhgjhghg");
    // Access cartCount value from req object
    const cartCount = req.cartCount;
    // Add the quantity of each product to the corresponding product object
    cartItems[0].productInfo.forEach((product, index) => {
      product.quantity = cartItems[0].products[index].quantity;
    });

    res.render("user/viewProductDetails", { user, video: true, cartCount, products: cartItems[0].productInfo })



  } catch (error) {
    console.log(error);
    res.status(500).send('Internal server error');
  }
}



exports.cancelOrder = async (req, res) => {
  console.log("delete??");

  let productId = req.query.productId;
  let orderId = req.query.orderId;
  let reason = req.query.reason; // Retrieve the reason from the query parameters
  console.log(productId, orderId, reason, 'first product, second order, reason');

  let orders = await Order.find({ _id: orderId })
    .populate({
      path: 'products.item',
      model: 'Product'
    })
    .exec();

  let product = null;
  for (let i = 0; i < orders.length; i++) {
    let order = orders[i];
    product = order.products.find(product => product.item._id.toString() === productId);
    if (product) {
      let orderUpdate = await Order.updateOne(
        { _id: orderId },
        {
          $set: {

            deliverystatus: "cancelled",

          }
        }
      );
      product.orderstatus = 'cancelled';
      product.deliverystatus = 'cancelled';
      product.reason = reason; // Assign the reason to the product
      await order.save();
      break; // Exit the loop once product is found
    }
  }
  console.log(orders, 'total');
  console.log(product, 'I got the product');
  res.redirect('/myOrders');
};


//  




exports.invoices = async (req, res) => {
  try {
    let user = req.session.user;
    const username = user.name;

    const orders = await Order.find({ userId: user._id })
      .sort("-updatedAt")
      .populate({
        path: "products.item",
        model: "Product",
      })
      .exec();
    const cartCount = req.cartCount;

    // Generate PDF invoice
    const doc = new PDFDocument();
    const filePath = "pdf/invoice.pdf"; // Set the desired file path
    doc.pipe(fs.createWriteStream(filePath));

    doc.font("Helvetica-Bold").fontSize(20).text("Invoice", { align: "center" });
    doc.moveDown();
    doc.fontSize(14).text(`Username: ${username}`);
    doc.moveDown();
    doc.fontSize(14).text("Order Details:");

    orders.forEach((order) => {
      doc.moveDown();
      doc.fontSize(12).text(`Order ID: ${order._id}`);
      order.products.forEach((product) => {
        doc.fontSize(12).text(`Product: ${product.item.name}`);
        doc.fontSize(12).text(`Quantity: ${product.quantity}`);
        doc.fontSize(12).text(`Price: ${product.currentPrice}`);
        doc.fontSize(12).text(`Tax: ${product.tax}`);
        doc.moveDown();
      });
    });

    doc.end();

    // Set the downloadable file name
    const fileName = "invoice.pdf";

    if (req.session.filterOrders) {
      res.locals.orders = req.session.filterOrders;
      req.session.filterOrders = null;
    } else if (req.session.noOrders) {
      res.locals.orders = req.session.noOrders;
      req.session.noOrders = null;
    } else if (req.session.cancelledOrders) {
      res.locals.orders = req.session.cancelledOrders;
      req.session.cancelledOrders = null;
    } else if (req.session.notShippedOrders) {
      res.locals.orders = req.session.notShippedOrders;
      req.session.notShippedOrders = null;
    } else if (req.session.returneddOrders) {
      res.locals.orders = req.session.returneddOrders;
      req.session.returneddOrders = null;
    } else {
      res.locals.orders = orders;
    }


    res.render("user/orderInvoice", {
      cartCount,
      orders,
      username,
      userloggedIn: req.session.userloggedIn,
      fileName,
    });
  } catch (error) {
    console.log(error);
  }
};





exports.paymentVerify = async (req, res) => {
  try {
    let details = req.body;
    console.log(req.body, 'hello this is my body')
    const crypto = require("crypto");
    let hmac = crypto.createHmac("sha256", "DdoRCQ8YTzkabIFOznw6B8L1");
    hmac.update(
      details['payment[razorpay_order_id]'] +
      "|" +
      details['payment[razorpay_payment_id]']
    );
    hmac = hmac.digest("hex");

    let orderResponse = details['order[receipt]']
    let orderObjId = new ObjectId(orderResponse);

    if (hmac === details['payment[razorpay_signature]']) {
      await Order.updateOne(
        { _id: orderObjId },
        {
          $set: {
            paymentstatus: "placed",
          },
        }
      );

      console.log("Payment is successful");
      res.json({ status: true });
    } else {
      await Order.updateOne(
        { _id: orderObjId },
        {
          $set: {
            paymentstatus: "failed",
          },
        }
      );
      console.log("Payment is failed");
      res.json({ status: false, errMsg: "" });
    }
  } catch (error) {
    console.log(error, "error");
    res.status(500).send("Internal server error");
  }
};




exports.paymentFailed = async (req, res) => {
  res.render("user/paymentFailed", { other: true });
};

exports.orderPlacedCod = (req, res) => {
  let user = req.session.user;

  try {
    res.render("user/OrderPlacedCod");
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};