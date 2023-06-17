const Offer = require("../models/offerSchema");
const Product = require('../models/productSchema')

exports.offer = async function (req, res, next) {
    try {
        const offer = await Offer.find({});
        const products = await Product.find({});
        // const categoryList = categories.map((category) => category.category);
        res.render("admin/offers", { products, noShow: true, offer, admin: true, });
    } catch (error) {
        next(error);
    }
};

// POST method for the form submission
exports.postoffer = async (req, res, next) => {
    try {
        const { title, discount, product, expires } = req.body;

        // Create a new offer document
        const newOffer = new Offer({
            title,
            discount,
            product,
            endDate: expires,
        });

        const products = await Product.findOne({ _id: product })

        if (products) {
            products.offerprice = discount;
            products.offerStatus = true;
            await products.save();

        }

        // Save the offer to the database
        const savedOffer = await newOffer.save();

        // Redirect or render a success message
        res.redirect("/admin/offers"); // Assuming there's a route for displaying all offers
    } catch (error) {
        next(error);
    }
};