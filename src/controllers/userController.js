import User from "../models/User"

export const getJoin = (req, res) => res.render("join", { pageTitle: "Join" });
export const postJoin = async (req, res) => {
    const { email, username, password, name, location } = req.body;
    await User.create({
        email, username, password, name, location,
    })
    return res.redirect("/login");
}
export const edit = (req, res) => res.send("Edit User");
export const remove = (Zreq, res) => res.send("Remove User");
export const login = (Zreq, res) => res.send("Login");
export const logout = (Zreq, res) => res.send("Log Out");
export const see = (Zreq, res) => res.send("See");