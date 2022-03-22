import bcrypt from "bcrypt";
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
    const user = await User.findOne({ username });
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

export const edit = (req, res) => res.send("Edit User");
export const remove = (req, res) => res.send("Remove User");
export const logout = (req, res) => res.send("Log Out");
export const see = (req, res) => res.send("See");