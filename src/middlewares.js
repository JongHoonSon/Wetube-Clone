export const localMiddleware = (req, res, next) => {
    res.locals.loggedIn = Boolean(req.session.loggedIn); // req.session.loggedIn 이 true 일 경우 res.locals.loggedIn 을 true로 함.
    res.locals.siteName = "Wetube";
    res.locals.loggedInUser = req.session.user;
    console.log(res.locals);
    next();
}