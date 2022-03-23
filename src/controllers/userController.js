import bcrypt from "bcrypt";
import fetch from "node-fetch";
import User from "../models/User"

export const getJoin = (req, res) => res.render("join", { pageTitle: "Join" });

export const postJoin = async (req, res) => {
    const { email, username, password, password2, name, location } = req.body;
    const exists = await User.exists({$or: [{username}, {email}]});
    if(password !== password2) {
        return res.status(400).render("join", { pageTitle: "Join", errorMessage: "Password confirmation does not match."});
    }
    if(exists) {
        return res.status(400).render("join", { pageTitle: "Join", errorMessage: "This username/email is already taken."});
    }
    try {
        await User.create({
            email, username, password, name, location,
        })
    } catch(error) {
        return res.status(400).render("join", { pageTitle: "Join", errorMessage: error._message });
    }
    return res.redirect("/login");
}

export const getLogin = (req, res) => res.render("Login", { pageTitle: "Login" });

export const postLogin = async (req, res) => {
    const { username, password } = req.body;
    const pageTitle = "Login";
    //check if account exists
    const user = await User.findOne({ username, socialOnly: false });
    if(!user) {
        return res.status(400).render("login", { pageTitle, errorMessage: "An account with this username does not exists."})
    }
    
    //check if password correct
    const ok = await bcrypt.compare(password, user.password);
    if(!ok) {
        return res.status(400).render("login", { pageTitle, errorMessage: "Wrong password"})
    }
    req.session.loggedIn = true;
    req.session.user = user;
    return res.redirect("/");
}

export const startGithubLogin = (req, res) => {
    //client_id=cc5dc9d57c3716aa44b0&allow_signup=false&scope=user:email
    const baseUrl = 'https://github.com/login/oauth/authorize';
    const config = {
        client_id: process.env.GH_CLIENT,
        allow_signup: false,
        scope: "read:user user:email"
    }
    const params = new URLSearchParams(config).toString();
    const finalUrl = `${baseUrl}?${params}`;
    return res.redirect(finalUrl);
}

export const finishGithubLogin = async (req, res) => {
    const baseUrl = "https://github.com/login/oauth/access_token"
    const config = {
        client_id: process.env.GH_CLIENT,
        client_secret: process.env.GH_SECRET,
        code: req.query.code,
    }
    const params = new URLSearchParams(config).toString();
    const finalUrl = `${baseUrl}?${params}`;
    const tokenRequest = await (
        await fetch(finalUrl, {
            method: "POST",
            headers: {
                Accept: "application/json",
            },
        })
    ).json();
    if("access_token" in tokenRequest) {
        const { access_token } = tokenRequest;
        const apiUrl = "https://api.github.com"
        const userData = await (
            await fetch(`${apiUrl}/user`, {
                headers: {
                    Authorization: `token ${access_token}`,
                },
            })
        ).json();
        console.log(userData);
        const emailData = await (
            await fetch(`${apiUrl}/user/emails`, {
                headers: {
                    Authorization: `token ${access_token}`,
                },
            })
        ).json();
        console.log(emailData);
        const emailObject = emailData.find(
            (email) => email.primary === true && email.verified === true
        );
        if(!emailObject) {
            return res.redirect("/login");
        }
        let user = await User.findOne({ email: emailObject.email });
        if(!user) {
            try {
                    user = await User.create({
                    email: emailObject.email,
                    avataUrl: userData.avatar_url,
                    username: userData.login,
                    password: "",
                    name: userData.name ? userData.name : userData.login,
                    location: userData.location,
                    socialOnly: true,
                });
            } catch(error) {
                console.log(error);
            };
        }
        req.session.loggedIn = true;
        req.session.user = user;
        return res.redirect("/");
    } else {
        return res.redirect("/login");
    }
}

export const logout = (req, res) => {
    req.session.destroy();
    return res.redirect("/");
};

export const edit = (req, res) => res.send("Edit User");
export const remove = (req, res) => res.send("Remove User");
export const see = (req, res) => res.send("See");