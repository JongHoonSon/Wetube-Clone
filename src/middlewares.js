import multer from "multer";

export const localMiddleware = (req, res, next) => {
    res.locals.loggedIn = Boolean(req.session.loggedIn); // req.session.loggedIn 이 true 일 경우 res.locals.loggedIn 을 true로 함.
    res.locals.siteName = "Wetube";
    res.locals.loggedInUser = req.session.user || {};
    // console.log(res.locals);
    next();
}

export const protectorMiddleware = (req, res, next) => {
    if(req.session.loggedIn) {
        next();
    } else {
        return res.redirect("/login");
    }
}

export const publicOnlyMiddleware = (req, res, next) => {
    if(!req.session.loggedIn) {
        next();
    } else {
        return res.redirect("/");
    }
}

export const avatarUpload = multer({
    dest: 'uploads/avatars/',
    limits: {
        fileSize: 3000000,
    }
});

export const videoUpload = multer({
    dest: 'uploads/videos/',
    limits: {
        fileSize: 10000000000, //단위 바이트
    }
});