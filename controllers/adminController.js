const bcrypt = require('bcrypt')
const Admin = require('../models/adminSchema')
const User = require('../models/userSchema')
const Order = require('../models/orderSchema')
const { ObjectId } = require("mongodb");
const jsPDF = require('jspdf');

//this function works when we click the login button on the login page.
// this function checks whether the email entered by the admin is in the database or not and store that in a variable and checks if the email is in the database.
// and if the case is true the password entered by the admin is compared with the password that stored in the DB.
//if the password matches it redirects to admin dashboard page else redirected to login page with an error msg.
exports.dashboard = async (req, res, next) => {
    let adminDetails = req.session.admin;
    const orders = await Order.find({})
        .populate({
            path: "products.item",
            model: "Product",
        })
        .exec();
    const totalCancelled = orders.reduce((accumulator, order) => {
        order.products.forEach((product) => {
            if (product.orderstatus === "cancelled") {
                accumulator += 1;
            }
        });
        return accumulator;
    }, 0);

    const totalQuantity = orders.reduce((accumulator, order) => {
        order.products.forEach((product) => {
            accumulator += product.quantity;
        });
        return accumulator;
    }, 0);

    const totalProfit = orders.reduce((acc, order) => {
        return acc + order.totalAmount;
    }, 0);

    const totalShipped = orders.reduce((accumulator, order) => {
        order.products.forEach((product) => {
            if (product.deliverystatus === "shipped") {
                accumulator += 1;
            }
        });
        return accumulator;
    }, 0);






    const startOfYear = new Date(new Date().getFullYear(), 0, 1); // start of the year
    const endOfYear = new Date(new Date().getFullYear(), 11, 31); // end of the year

    let orderBasedOnMonths = await Order.aggregate([
        // match orders within the current year
        { $match: { createdAt: { $gte: startOfYear, $lte: endOfYear } } },

        // group orders by month
        {
            $group: {
                _id: { $month: "$createdAt" },
                orders: { $push: "$$ROOT" },
            },
        },

        // project the month and orders fields
        {
            $project: {
                _id: 0,
                month: "$_id",
                orders: 1,
            },
        },
        {
            $project: {
                month: 1,
                orderCount: { $size: "$orders" },
            },
        },
        {
            $sort: { month: 1 },
        },
    ]);

    // console.log(orderBasedOnMonths, "vall");
    order_count = orderBasedOnMonths[0]["orderCount"];
    // console.log(order_count);
    //  console.log(totalQuantity,totalProfit,totalShipped,totalCancelled,'ordercount')
    res.render("admin/index2", {
        admin: true,
        adminDetails,
        totalQuantity,
        order_count,
        totalProfit,
        totalCancelled,
        totalShipped,
        orderBasedOnMonths,
        noShow: true,
    });
};


exports.postLogin = async (req, res) => {
    try {
        // console.log(req.body,'nnnnnn');
        const newAdmin = await Admin.findOne({ email: req.body.email });
        console.log(newAdmin);
        if (newAdmin) {

            bcrypt.compare(req.body.password, newAdmin.password).then((status) => {
                if (status) {
                    console.log("User Exist");
                    req.session.admin = newAdmin;
                    req.session.adminLoggedIn = true;
                    console.log(newAdmin);
                    res.redirect("/admin/home");
                } else {
                    req.session.loginErr = "invalid Email or Password";
                    console.log("password is not matching");
                    res.status(400).redirect("/admin/admin-login");
                }
            });
        }
    } catch (error) {
        console.log(error);
    }
};


// this function is for admin side signup, it works when we click the sign up button. when the button is clicked, the function first checks if the mail given by the admin exist on DB .=> normal signup procedures.
exports.postSignup = async (req, res, next) => {
    console.log("hai");
    try {
        console.log("signup");
        const existingAdmin = await Admin.findOne({ name: req.body.name })
        if (existingAdmin) {
            console.log(`Admin with name ${req.body.name} already exist`);

            res.redirect('/admin/admin-signup')

        }
        else {
            const hashedPassword = await bcrypt.hash(req.body.password, 10);
            console.log(hashedPassword);
            const newAdmin = new Admin({
                id: Date.now().toString(),
                name: req.body.name,
                mobile: req.body.mobile,
                email: req.body.email,
                password: hashedPassword,
                status: false,
                isActive: true,
            });
            Admin.create(newAdmin);
            console.log(newAdmin);
            res.redirect("/admin/admin-login");

        }
    } catch (error) {
        console.log(error);
        res.redirect("/admin/admin-signup");
    }
};

//admin side user controller

// this function is for getting the user details with pagination
exports.userslist = async (req, res) => {
    try {
        let adminDetails = req.session.admin;
        let currPage = parseInt(req.query.page)
        let usersLists = await User.find();
        let userCount;
        let perPage = 2

        let usersList = await User.find().count()
            .then(docs => {
                userCount = docs

                return User.find().skip((currPage - 1) * perPage).limit(perPage)
            })
        let pages = Math.ceil(userCount / perPage)
        console.log(usersList);
        res.render('admin/users', { usersList, admin: true, adminDetails, noShow: true, pages, currPage });
    } catch (error) {
        console.log(error);
    }

}

//admin side user management below 
//this function is used to block a user.

exports.blockUser = async (req, res) => {
    await User.updateOne({ _id: req.params.id }, { isActive: false });
    res.redirect('/admin/user')
}

// this function is used to unblock a blocked user.
exports.unBlockUser = async (req, res) => {
    await User.updateOne({ _id: req.params.id }, { isActive: true });
    res.redirect('/admin/user')
}

//this function is used for deleting a user.. not currently using now 
exports.deleteUser = async (req, res) => {
    try {

        await User.deleteOne({ _id: req.params.id });

        res.redirect("/admin/users");

    } catch (error) {
        console.log(error)
    }
}

exports.salesReport = async (req, res) => {
    let adminDetails = req.session.admin;
    console.log(req.session.admin, "??????????????????????????????????")
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

    if (req.session.admin.orderThisWeek) {
        res.locals.orders = req.session.admin.orderThisWeek;
        req.session.admin.orderThisWeek = null;
    } else if (req.session.admin.orderThisMonth) {
        res.locals.orders = req.session.admin.orderThisMonth;
        req.session.admin.orderThisMonth = null;
    } else if (req.session.admin.orderThisDay) {
        res.locals.orders = req.session.admin.orderThisDay;
        req.session.admin.orderThisDay = null;
    } else if (req.session.admin.orderThisYear) {
        console.log("❤️❤️❤️❤️❤️❤️");
        res.locals.orders = req.session.admin.orderThisYear;
        req.session.admin.orderThisYear = null;
    } else {
        console.log("❤️❤️❤️❤️❤️❤️");
        res.locals.orders = orders;
        console.log(orders, ";;;;;;;;;;;;;;;;;;;;;;;;");
    }
    console.log(orders, 'sales reprot order summary')
    res.render('admin/salesReport', { admin: true, adminDetails })
}


exports.getSalesReport = async (req, res) => {
    console.log("/////////////////////////////////helllooooooooooooooo");
    console.log(req.body.selector, 'report body ')
    const selector = req.body.selector;

    // Extracting the relevant parts based on the selector
    let year, month, weekStart, weekEnd, day;
    if (selector.startsWith('year')) {
        year = parseInt(selector.slice(5));
    } else if (selector.startsWith('month')) {
        const parts = selector.split('-');
        year = parseInt(parts[1]);
        month = parseInt(parts[2]);
    } else if (selector.startsWith('week')) {
        const today = new Date();
        weekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
        weekEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay() + 6);
        console.log(weekStart, 'weekstart')
        console.log(weekEnd, 'weekEnd')

    } else if (selector.startsWith('day')) {
        day = new Date(selector.slice(4));
        day.setHours(0, 0, 0, 0);
    }


    if (weekStart && weekEnd) {
        const orderThisWeek = await Order.find({ createdAt: { $gte: weekStart, $lte: weekEnd } }).populate({
            path: 'userId',
            model: 'User',
            select: 'name email' // select the fields you want to include from the User document
        })
            .populate({
                path: 'products.item',
                model: 'Product'
            })
            .exec();;
        req.session.admin.orderThisWeek = orderThisWeek;
        console.log(orderThisWeek, 'details of this week');
        return res.redirect('/admin/salesReport')

    }

    if (year && month) {
        const startOfMonth = new Date(year, month - 1, 1);
        const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);
        const orderThisMonth = await Order.find({ createdAt: { $gte: startOfMonth, $lte: endOfMonth } }).populate({
            path: 'userId',
            model: 'User',
            select: 'name email' // select the fields you want to include from the User document
        })
            .populate({
                path: 'products.item',
                model: 'Product'
            })
            .exec();
        req.session.admin.orderThisMonth = orderThisMonth;
        console.log(orderThisMonth, 'details of this month');
        return res.redirect('/admin/salesReport')

    }

    if (day) {
        const startOfDay = new Date(day);
        const endOfDay = new Date(day);
        endOfDay.setDate(endOfDay.getDate() + 1);
        endOfDay.setSeconds(endOfDay.getSeconds() - 1);
        const orderThisDay = await Order.find({ createdAt: { $gte: startOfDay, $lte: endOfDay } }).populate({
            path: 'userId',
            model: 'User',
            select: 'name email' // select the fields you want to include from the User document
        })
            .populate({
                path: 'products.item',
                model: 'Product'
            })
            .exec();;
        req.session.admin.orderThisDay = orderThisDay;
        console.log(orderThisDay, 'details of this day');
        return res.redirect('/admin/salesReport')

    }
    if (year) {
        const orderThisYear = await Order.find({ createdAt: { $gte: new Date(year, 0, 1), $lte: new Date(year, 11, 31, 23, 59, 59, 999) } }).populate({
            path: 'userId',
            model: 'User',
            select: 'name email' // select the fields you want to include from the User document
        })
            .populate({
                path: 'products.item',
                model: 'Product'
            })
            .exec();
        req.session.admin.orderThisYear = orderThisYear;
        console.log(orderThisYear, 'details of this year')
        return res.redirect('/admin/salesReport')

    }


}


exports.getSalesData = async (req, res) => {
    const { year } = req.body;
    console.log(year);

    try {
        // Fetch the sales data for the selected year from your database
        const salesData = await Order.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: new Date(year, 0, 1),
                        $lte: new Date(year, 11, 31, 23, 59, 59, 999),
                    },
                },
            },
            {
                $group: {
                    _id: { $month: '$createdAt' },
                    totalSales: { $sum: '$totalAmount' },
                },
            },
        ]);

        console.log(salesData, "salesdata");

        // Prepare the sales data in the desired format
        const formattedSalesData = {};
        salesData.forEach((item) => {
            const month = new Date(item._id + '-01').toLocaleString('default', { month: 'short' });
            formattedSalesData[month] = item.totalSales;
        });
        console.log(formattedSalesData)

        res.json({ success: true, salesData: formattedSalesData });

    } catch (error) {
        console.error('Error fetching sales data:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch sales data' });
    }
};

