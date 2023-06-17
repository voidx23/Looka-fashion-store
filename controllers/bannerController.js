const Banner = require('../models/bannerSchema')
const fs = require('fs')
const multer = require("multer");

//storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        return cb(null, "./public/uploads");
    },
    filename: function (req, file, cb) {
        return cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({ storage });
/**
 * 
 * GET Banner management page for admin
 */
exports.getBanner = async (req, res) => {

    const allBanners = await Banner.find({})

    console.log(allBanners, "💕💕💕💕");

    res.render('admin/banner', {
        currPage: 'Banners',
        allBanners,
        bannerAdded: req.session.admin.bannerAdded,
        bannerUpdated: req.session.admin.bannerUpdated,
        noShow: true
    })
    req.session.admin.bannerAdded = false
    req.session.admin.bannerUpdated = false
    req.session.save()
}

/* GET Add banner form */
exports.getBannerForm = (req, res) => {
    res.render('admin/add-banner', {
        currPage: 'Banners',
        bannerMsg: req.session.admin.bannerMsg,
        noShow: true,
    })
    req.session.admin.bannerMsg = undefined
    req.session.save()
}

/* POST banner add form  */
exports.addBanner = async (req, res) => {
    upload.array("bannerImg", 5)(req, res, async (err) => {
        if (err) {
            console.log(err);
            return next(err);
        }
        console.log(req.body);
        console.log(req.files);
        // console.log(req.body.category,'hellloooooooo')
        try {
            const banner = new Banner({
                name: req.body.name,

                imgName: req.files.map((file) => file.filename),
            });
            await Banner.create(banner);
            console.log(banner);
            res.redirect("/admin/banner");
        } catch (error) {
            console.log(error);
        }
    });
};

/* PATCH change banner status */
exports.patchBannerStatus = async (req, res) => {
    let { bannerId, currStat } = req.body
    currStat = JSON.parse(currStat)

    const banners = await Banner.find()
    let count = 0
    banners.forEach(banner => {
        if (banner.currentBanner) {
            count++
        }
    })
    if (count == 2 && currStat === false) {
        return res.json({ statusChanged: false, msg: 'Default Active Banner Limit Reached' })
    }

    const banner = await Banner.findById(bannerId)
    if (banner.currentBanner === currStat) {
        await Banner.updateOne(
            {
                _id: banner._id
            },
            {
                $set: { currentBanner: !currStat }
            }
        ).then(() => res.json({ statusChanged: true, newStatus: !currStat }))
    }
}

/* GET edit banner */
exports.getEditBanner = async (req, res) => {
    const banner = await Banner.findById(req.params.id)
    res.render('admin/edit-banner', {
        currPage: 'Banners',
        banner,
        bannerExist: req.session.admin.bannerExist
    })
    req.session.admin.bannerExist = false
    req.session.save()
}

/* POST edit banner */
exports.postEditBanner = async (req, res) => {

    upload.array("bannerImg", 5)(req, res, async (err) => {
        if (err) {
            console.log(err);
            return next(err);
        }
        const { bannerId, name } = req.body
        const image = req.files.map((file) => file.filename)

        console.log(image, "❤️❤️❤️");
        const banners = await Banner.find()
        let exist = false

        for (let i = 0; i < banners.length; i++) {
            if (banners[i]['name'].toLowerCase() === name.toLowerCase() && banners[i]['name'] !== name) {
                exist = true
                break
            }
        }


        if (exist) {
            if (image.length > 0) {
                fs.unlink('./public/uploads/' + image[0].filename, err => {
                    if (err) throw err
                    console.log('banner image deleted');
                })
            }
            req.session.admin.bannerExist = true
            return res.redirect('/admin/edit-banner/' + bannerId)
        } else {

            console.log("else worked");
            if (image.length > 0) {
                await Banner.findById(bannerId)
                    .then(banner => {
                        fs.unlink('./public/uploads/' + banner.imgName[0], err => {
                            if (err) throw err
                            console.log('old banner image deleted');
                        })
                        return banner
                    })
                    .then(async banner => {
                        await Banner.updateOne(
                            { _id: bannerId },
                            { $pop: { imgName: 1 }, }
                        )
                    })
                await Banner.updateOne(
                    { _id: bannerId },
                    {

                        $push: { imgName: image[0] },
                        $set: { name: name }
                    } 
                )
                    .then((done) => {
                        console.log(done);
                        req.session.admin.bannerUpdated = true
                        res.redirect('/admin/banner')
                    })
            } else {
                await Banner.updateOne(
                    {
                        _id: bannerId
                    },
                    {
                        $set: { name: name }
                    }
                ).then(() => {
                    req.session.admin.bannerUpdated = true
                    res.redirect('/admin/banner')
                })
            }
        }
    })
}

/* DELETE banner */
exports.deleteBanner = async (req, res) => {
    const bannerId = req.body.id
    await Banner.findById(bannerId)
        .then(banner => {
            if (!banner.currentBanner) {
                fs.unlink('./public/uploads/' + banner.imgName[0], err => {
                    if (err) console.log(err);
                    console.log('banner image deleted');
                })
            }
        })
    await Banner.deleteOne({ _id: bannerId, currentBanner: false })
        .then(done => {
            if (done.deletedCount > 0) {
                res.json({ bannerDeleted: true })
            } else {
                res.json({ bannerDeleted: false })
            }
        })
        .catch(err => {
            console.error(err);
            res.json({ bannerDeleted: false })
        })
}
