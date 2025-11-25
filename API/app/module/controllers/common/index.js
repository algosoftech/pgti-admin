const multer = require('multer');
const storage = new multer.memoryStorage();
const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png','image/webp'];
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG and PNG are allowed.'));
        }
    },
    limits: { fileSize: 2 * 1024 * 1024 }
});
const router = require('express').Router({
    caseSensitive   : true,
    strict          : true
});

const clipArtController = require('./clipArtControllers');
const authCheck = require('../../../util/authCheck')

router.post('/upload', authCheck, upload.single('image'), clipArtController.addImage);
router.post('/delete', authCheck, clipArtController.removeImage);
router.post('/list', authCheck, clipArtController.list);

exports.router = router;    