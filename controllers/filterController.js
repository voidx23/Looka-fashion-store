const bcrypt = require('bcrypt')
const User = require('../models/userSchema')
const Product = require("../models/productSchema")
const Order = require("../models/orderSchema")
const Categories = require("../models/categorySchema")
const mongoose = require("mongoose");
const otp = require('../controllers/otp');
const { cartCount } = require('./shoppingCartController');
const ObjectId = mongoose.Types.ObjectId;



// exports.postFilter = async (req, res, next) => {

//     try {
//         // const { minPrice, maxPrice, sizes } = req.body;
//         const productType = req.body["producttype[]"];
//         const color = req.body["color[]"];
//         const pattern = req.body["pattern[]"];
//         const productCategory = req.body["productCategory[]"];
//         const sorted = req.body.sorted;

//         let sort = { createdAt: -1 };


//         console.log(sorted, "sorted");



//         if (sorted) {
//             let sortField = "ourPrice";
//             let sortOrder = 1;

//             if (sorted == "htl") {
//                 sortOrder = -1;
//             } else if (sorted == "lth") {
//                 sortOrder = 1;
//             } else if (sorted == "popularity") {
//                 sortOrder = 1;
//             } else {
//                 sortField = "createdAt";
//                 sortOrder = -1;
//             }
//             sort = { [sortField]: sortOrder };
//         }
//         // Construct the filter object
//         req.sort = sort;
//         const filter = {};
//         // if (minPrice && maxPrice) {
//         //   filter.ourPrice = {
//         //     $gte: parseInt(minPrice),
//         //     $lte: parseInt(maxPrice),
//         //   };
//         // } else if (minPrice) {
//         //   filter.ourPrice = { $gte: parseInt(minPrice) };
//         // } else if (maxPrice) {
//         //   filter.ourPrice = { $lte: parseInt(maxPrice) };
//         // }

//         if (productType) {
//             filter.productType = { $in: productType };
//         }

//         if (productCategory) {
//             filter.productCategory = productCategory;
//         }

//         if (color) {
//             filter.color = { $in: color };
//         }
//         if (pattern) {
//             filter.pattern = { $in: pattern };
//         }

//         // if (sizes) {
//         //   filter.sizes = { $in: sizes };
//         // }

//         req.filterData = filter;
//         console.log(filter, "filter"); 2
//         next();
//     } catch (err) {
//         console.error(err);
//         res.sendStatus(500);
//     }
// }


// exports.productFilterList = async (req, res, next) => {
//     try {

//         console.log("hih ello");
//         const count = 20;
//         const page = parseInt(req.query.page) || 1;
//         const filter = req.filterData || {};
//         const sort = req.sort || { createdAt: -1 };
//         const startIndex = (page - 1) * count;
//         console.log(count, page, filter, sort);
//         let productsList = await Product.find(filter)
//             .sort(sort)
//             .skip(startIndex)
//             .limit(count)
//             .lean();
//         const totalCount = await Product.countDocuments(filter);
//         console.log(totalCount + "fsh");
//         const totalPages = Math.ceil(totalCount / count);
//         console.log(totalPages, "after total pages");
//         const endIndex = Math.min(count, totalCount - startIndex);
//         console.log(endIndex, "after endindex");
//         const categories = await Categories.aggregate([
//             {
//                 $match: {
//                     categoryname: {
//                         $in: ["productType", "color", "pattern", "productCategory"],
//                     },
//                 },
//             },
//             { $group: { _id: "$categoryname", values: { $addToSet: "$value" } } },
//         ]);

//         console.log(categories)

//         const pagination = {
//             totalCount,
//             totalPages,
//             page,
//             count,
//             startIndex,
//             endIndex,
//         };

//         const loggedIn = req.session.userLoggedIn || false;
//         const fullName = req.session.user?.fullName || "";

//         res.render("user/productMen", {
//             title: "Product List",
//             noShow: true,
//             loggedIn,
//             fullName,
//             productsList,
//             categories,
//             pagination,
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).send("Internal server error");
//     }
// },


//     exports.searchProductFilterList = async (req, res, next) => {
//         try {
//             const count = 20;
//             const page = parseInt(req.query.page) || 1;
//             const filter = req.filterData || {};
//             const sort = req.sort || { createdAt: -1 };
//             filter.name = { $regex: `.*${req.body.value}.*`, $options: "i" };
//             console.log(count, page, filter, sort);

//             let productsList = await Product.find(filter)
//                 .sort(sort)
//                 .skip((page - 1) * count)
//                 .limit(count)
//                 .lean();
//             console.log(productsList);
//             const totalCount = await Product.countDocuments(filter);
//             const totalPages = Math.ceil(totalCount / count);
//             const startIndex = (page - 1) * count;
//             const endIndex = Math.min(startIndex + count, totalCount);

//             const categories = await categories.aggregate([
//                 {
//                     $match: {
//                         categoryname: {
//                             $in: ["productType", "color", "pattern", "productCategory"],
//                         },
//                     },
//                 },
//                 { $group: { _id: "$categoryname", values: { $addToSet: "$value" } } },
//             ]);

//             const pagination = {
//                 totalCount,
//                 totalPages,
//                 page,
//                 count,
//                 startIndex,
//                 endIndex,
//             };

//             const loggedIn = req.session.userLoggedIn || false;
//             const fullName = req.session.user?.fullName || "";

//             res.render("user/productMen", {
//                 title: "Product List",
//                 noShow: true,
//                 loggedIn,
//                 fullName,
//                 productsList,
//                 categories,
//                 pagination,
//             });
//         } catch (error) {
//             console.error(error);
//             res.status(500).send("Internal server error");
//         }
//     }


// exports.getAllCategory = async (req, res, next) => {
//     try {
//         req.productCategory = await Categories.find({
//             categoryname: "productCategory",
//             isActive: true,
//         });
//         req.color = await Categories.find({
//             categoryname: "color",
//             isActive: true,
//         });
//         req.pattern = await Categories.find({
//             categoryname: "pattern",
//             isActive: true,
//         });
//         req.productType = await Categories.find({
//             categoryname: "productType",
//             isActive: true,
//         });
//         next();
//     } catch (error) {
//         console.log(error);
//     }
// }


// exports.getFilter = async (req, res, next) => {
//     console.log(req.body, "body");
//     try {
//         const { minPrice, maxPrice, sizes } = req.query;

//         const sorted = req.query.sorted;

//         let sort = { createdAt: -1 };

//         if (sorted) {
//             let sortField = "price";
//             let sortOrder = 1;

//             if (sorted == "htl") {
//                 sortOrder = -1;
//             } else if (sorted == "lth") {
//                 sortOrder = 1;
//             } else if (sorted == "popularity") {
//                 sortOrder = 1;
//             } else {
//                 sortField = "createdAt";
//                 sortOrder = -1;
//             }
//             sort = { [sortField]: sortOrder };
//         }
//         // Construct the filter object
//         req.sort = sort;
//         const filter = {};
//         if (minPrice && maxPrice) {
//             filter.ourPrice = {
//                 $gte: parseInt(minPrice),
//                 $lte: parseInt(maxPrice),
//             };
//         } else if (minPrice) {
//             filter.ourPrice = { $gte: parseInt(minPrice) };
//         } else if (maxPrice) {
//             filter.ourPrice = { $lte: parseInt(maxPrice) };
//         }

//         // if (genderType) {
//         //     try {
//         //         const genderTypeid = await Categories.findOne({
//         //             values: genderType,
//         //         });
//         //         if (genderTypeid) {
//         //             filter.genderType = genderTypeid._id;
//         //         } else {
//         //             // handle null case
//         //             console.log("Gender type not found");
//         //         }
//         //     } catch (err) {
//         //         // handle error
//         //         console.error(err);
//         //         res.sendStatus(500);
//         //     }
//         // }

//         // if (sizes) {
//         //     filter.sizes = { $in: sizes };
//         // }

//         req.filterData = filter;
//         console.log(filter, "filter");
//         next();
//     } catch (err) {
//         console.error(err);
//         res.sendStatus(500);
//     }
// }

// exports.productList = async (req, res, next) => {
//     try {
//         const count = 20;
//         const page = parseInt(req.query.page) || 1;
//         const filter = req.filterData;
//         const sort = req.sort;
//         let productsList;
//         const startIndex = (page - 1) * count;

//         if (filter) {
//             productsList = await Product.find(filter)
//                 .sort(sort)
//                 .skip(startIndex)
//                 .limit(count)
//                 .lean();
//         } else {
//             productsList = await Product.find()
//                 .sort(sort)
//                 .skip(startIndex)
//                 .limit(count)
//                 .lean();
//         }

//         const totalCount = await Product.countDocuments(filter);
//         console.log(totalCount);
//         const totalPages = Math.ceil(totalCount / count);
//         const endIndex = Math.min(count, totalCount - startIndex);

//         const pagination = {
//             totalCount: totalCount,
//             totalPages: totalPages,
//             page: page,
//             count: count,
//             startIndex: startIndex,
//             endIndex: endIndex,
//         };

//         if (req.session.userLoggedIn) {
//             res.render("user/productMen", {
//                 title: "Users List",
//                 fullName: req.session.user.name,
//                 loggedin: req.session.userLoggedIn,
//                 productsList,
//                 pagination,
//                 cartItems: req.cartItems,
//                 productCategory: req.productCategory,
//                 color: req.colour,
//                 pattern: req.pattern,
//                 productType: req.productType,
//             });
//         } else {
//             res.render("user/productMen", {
//                 title: "Product List",
//                 loggedin: false,
//                 productsList,
//                 cartItems: req.cartItems,
//                 pagination, // add pagination to the render parameters
//                 productCategory: req.productCategory,
//                 color: req.colour,
//                 pattern: req.pattern,
//                 productType: req.productType,
//             });
//         }
//     } catch (error) {
//         next(error);
//     }
// }
// exports.getProductView = async (req, res, next) => {
//     try {
//         const count = 10;
//         const page = 1;
//         const productsList = await Product.find()
//             .skip((page - 1) * count)
//             .limit(count)
//             .lean();

//         const totalPages = Math.ceil((await Product.countDocuments()) / count);
//         const startIndex = (page - 1) * count;

//         const endIndex = Math.min(
//             startIndex + count,
//             await Product.countDocuments()
//         );
//         const productItem = await Product.aggregate([
//             {
//                 $match: {
//                     _id: new mongoose.Types.ObjectId(req.params.productId),
//                 },
//             },
//             {
//                 $lookup: {
//                     from: "category",
//                     localField: "productCategory",
//                     foreignField: "_id",
//                     as: "productCategory",
//                 },
//             },
//             {
//                 $lookup: {
//                     from: "category",
//                     localField: "color",
//                     foreignField: "_id",
//                     as: "color",
//                 },
//             },
//             {
//                 $lookup: {
//                     from: "category",
//                     localField: "pattern",
//                     foreignField: "_id",
//                     as: "pattern",
//                 },
//             },
//             {
//                 $lookup: {
//                     from: "category",
//                     localField: "productType",
//                     foreignField: "_id",
//                     as: "productType",
//                 },
//             },
//         ]);
//         console.log(productItem);
//         if (req.session.userLoggedIn) {
//             res.render("user/productDetail", {
//                 title: "Users List",
//                 fullName: req.session.user.name,
//                 loggedin: req.session.userLoggedIn,
//                 cartItems: req.cartItems,
//                 productItem,
//                 productsList,
//                 count,
//                 page,
//                 totalPages,
//                 startIndex,
//                 endIndex,
//             });
//         } else {
//             res.render("user/productDetail", {
//                 title: "Users List",
//                 loggedin: false,
//                 cartItems: req.cartItems,
//                 productItem,
//                 productsList,
//                 count,
//                 page,
//                 totalPages,
//                 startIndex,
//                 endIndex,
//             });
//         }
//     } catch (error) {
//         next(error);
//     }
// }

exports.filterproducts = async function (req, res) {
    try {
        var minPrice = parseFloat(req.query.minPrice);
        var maxPrice = parseFloat(req.query.maxPrice);

        var productsQuery = { deleted: false };

        if (minPrice && maxPrice) {
            productsQuery.price = { $gte: minPrice, $lte: maxPrice };
        }

        const filteredProducts = await Product.find(productsQuery);

        // Return the filtered products as a JSON response
        res.setHeader("Content-Type", "application/json");
        res.send(JSON.stringify(filteredProducts));
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal server error" });
    }
};

exports.search = async (req, res) => {
    try {
        const query = req.query.q || '';
        if (query.length < 2) {
            res.json({ suggestions: [] });
            return;
        }

        // Perform the search using the query parameter
        const suggestions = await Product.find({ name: { $regex: query, $options: 'i' } }).limit(10);

        // Return a JSON response with the search suggestions
        res.json({ suggestions: suggestions.map((product) => product.name) });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while retrieving search suggestions.' });
    }
};

exports.searching = async (req, res) => {
    try {
        // Get the search query from the request
        const query = req.query.query;

        // Perform the search operation (e.g., querying a database)
        const searchProducts = await Product.find({ name: query });
        console.log(searchProducts, "done");
        // Return the results as JSON
        res.json(searchProducts);
        console.log("response sent");
    } catch (error) {
        // Handle any errors that occurred during the search
        console.error(error);
        res.status(500).json({ error: 'An error occurred during the search.' });
    }
};