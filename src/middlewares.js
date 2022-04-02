import aws from "aws-sdk";
import multer from "multer";
import multerS3 from "multer-s3";
// 
// API KEY 를 이용해 S3 객체 생성
export const s3 = new aws.S3({
    credentials: {
        accessKeyId: process.env.AWS_ID,
        secretAccessKey: process.env.AWS_SECRET,
    }
})

const isHeroku = process.env.NODE_ENV === "production";

const s3ImageUploader = multerS3({
    s3: s3,
    bucket: 'jh-wetube/images',
    Condition: {
        StringEquals: {
            "s3:x-amz-acl": ["public-read"],
        },
    }
});

const s3VideoUploader = multerS3({
    s3: s3,
    bucket: 'jh-wetube/videos',
    Condition: {
        StringEquals: {
            "s3:x-amz-acl": ["public-read"],
        },
    }
});

export const localMiddleware = (req, res, next) => {
    res.locals.loggedIn = Boolean(req.session.loggedIn); // req.session.loggedIn 이 true 일 경우 res.locals.loggedIn 을 true로 함.
    res.locals.siteName = "Wetube";
    res.locals.loggedInUser = req.session.user || {};
    res.locals.isHeroku = isHeroku;
    // console.log(res.locals);
    next();
}

export const protectorMiddleware = (req, res, next) => {
    if(req.session.loggedIn) {
        next();
    } else {
        req.flash("error", "Not authorized");
        return res.redirect("/login");
    }
}

export const publicOnlyMiddleware = (req, res, next) => {
    if(!req.session.loggedIn) {
        next();
    } else {
        req.flash("error", "Not authorized");
        return res.redirect("/");
    }
}

export const avatarUpload = multer({
    dest: 'uploads/avatars/',
    limits: {
        fileSize: 3000000,
    },
    storage: isHeroku ? s3ImageUploader : undefined,
});

export const videoUpload = multer({
    dest: 'uploads/videos/',
    limits: {
        fileSize: 10000000000, //단위 바이트
    },
    storage: isHeroku ? s3VideoUploader : undefined,
});