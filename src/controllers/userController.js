import bcrypt from "bcrypt";
import fetch from "node-fetch";
import { s3 } from "../middlewares";
import User from "../models/User";
import Video from "../models/Video";

export const getJoin = (req, res) =>
  res.render("users/join", { pageTitle: "Join" });

export const postJoin = async (req, res) => {
  const { email, username, password, password2, name, location } = req.body;
  const exists = await User.exists({ $or: [{ username }, { email }] });
  if (password !== password2) {
    req.flash("error", "Password confirmation does not match.");
    return res.status(400).render("users/join", { pageTitle: "Join" });
  }
  if (exists) {
    req.flash("error", "This username/email is already taken.");
    return res.status(400).render("users/join", { pageTitle: "Join" });
  }
  try {
    await User.create({
      email,
      username,
      password,
      name,
      location,
    });
  } catch (error) {
    req.flash("error", "Error occurred.");
    return res.status(400).render("users/join", {
      pageTitle: "Join",
      errorMessage: error._message,
    });
  }
  return res.redirect("/login");
};

export const getLogin = (req, res) =>
  res.render("users/login", { pageTitle: "Login" });
//
export const postLogin = async (req, res) => {
  const { username, password } = req.body;
  const pageTitle = "Login";
  //check if account exists
  const user = await User.findOne({ username, socialOnly: false });
  if (!user) {
    req.flash("error", "An account with this username does not exists.");
    return res.status(400).render("users/login", { pageTitle });
  }

  //check if password correct
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    req.flash("error", "Incorrect Password.");
    return res.status(400).render("users/login", { pageTitle });
  }
  req.session.loggedIn = true;
  req.session.user = user;
  req.flash("info", `Hello, ${user.name} !`);
  return res.redirect("/");
};

export const startGithubLogin = (req, res) => {
  //client_id=cc5dc9d57c3716aa44b0&allow_signup=false&scope=user:email
  const baseUrl = "https://github.com/login/oauth/authorize";
  const config = {
    client_id: process.env.GH_CLIENT,
    allow_signup: false,
    scope: "read:user user:email",
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  return res.redirect(finalUrl);
};

export const finishGithubLogin = async (req, res) => {
  const baseUrl = "https://github.com/login/oauth/access_token";
  const config = {
    client_id: process.env.GH_CLIENT,
    client_secret: process.env.GH_SECRET,
    code: req.query.code,
  };
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
  if ("access_token" in tokenRequest) {
    const { access_token } = tokenRequest;
    const apiUrl = "https://api.github.com";
    const userData = await (
      await fetch(`${apiUrl}/user`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();
    const emailData = await (
      await fetch(`${apiUrl}/user/emails`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();
    const emailObject = emailData.find(
      (email) => email.primary === true && email.verified === true
    );
    if (!emailObject) {
      return res.redirect("/login");
    }
    let user = await User.findOne({ email: emailObject.email });
    if (!user) {
      try {
        user = await User.create({
          email: emailObject.email,
          avatarUrl: userData.avatar_url,
          username: userData.login,
          password: "",
          name: userData.name ? userData.name : userData.login,
          location: userData.location,
          socialOnly: true,
        });
      } catch (error) {}
    }
    req.session.loggedIn = true;
    req.session.user = user;
    return res.redirect("/");
  } else {
    return res.redirect("/login");
  }
};

export const logout = (req, res) => {
  req.session.user = null;
  res.locals.loggedInUser = req.session.user;
  req.session.loggedIn = false;
  req.flash("info", "Good Bye !");
  return res.redirect("/");
};

export const getUserEdit = (req, res) => {
  return res.render("users/edit-profile", { pageTitle: "Edit Profile" });
};

export const postUserEdit = async (req, res) => {
  const {
    session: {
      user: { _id, avatarUrl },
    },
    body: { name, email, username, location },
    file,
  } = req;
  if (email !== req.session.user.email) {
    const exists = await User.exists({ email });
    if (exists) {
      req.flash("error", "This email is already taken.");
      return res
        .status(400)
        .render("users/edit-profile", { pageTitle: "Edit profile" });
    }
  }
  if (username !== req.session.user.username) {
    const exists = await User.exists({ username });
    if (exists) {
      req.flash("error", "This username is already taken.");
      return res
        .status(400)
        .render("users/edit-profile", { pageTitle: "Edit profile" });
    }
  }
  const updatedUser = await User.findByIdAndUpdate(
    _id,
    {
      avatarUrl: file
        ? res.locals.isHeroku
          ? file.location
          : file.path
        : avatarUrl,
      name,
      email,
      username,
      location,
    },
    { new: true }
  );

  console.log("avatarUrl", avatarUrl);

  if (res.locals.isHeroku && avatarUrl && !avatarUrl.includes("github")) {
    const delAvatarUrl = avatarUrl.split("/");
    const delAvatarFileName = delAvatarUrl[delAvatarUrl.length - 1];
    const params = {
      Bucket: "jh-wetube",
      Key: "images/" + delAvatarFileName,
    };
    s3.deleteObject(params, function (err, data) {
      if (err) {
        console.log("aws video delete error");
        console.log(err, err.stack);
        return res.redirect("/");
      } else {
        console.log("aws video delete success" + data);
      }
    });
  }
  req.session.user = updatedUser;
  req.flash("success", "Changes saved.");
  return res.redirect(`/users/${_id}`);
};

export const getChangePassword = (req, res) => {
  if (req.session.user.socialOnly === true) {
    req.flash(
      "info",
      "You were logged in with a social account. So you can't change password."
    );
    return res.redirect("/");
  }
  return res.render("users/change-password", { pageTitle: "Change Password" });
};

export const postChangePassword = async (req, res) => {
  const {
    session: {
      user: { _id },
    },
    body: { oldPassword, newPassword, newPasswordConfirmation },
  } = req;
  const user = await User.findById(_id);
  const ok = await bcrypt.compare(oldPassword, user.password);
  if (!ok) {
    req.flash("error", "Current password is incorrect");
    return res
      .status(400)
      .render("users/change-password", { pageTitle: "Change Password" });
  }
  if (newPassword !== newPasswordConfirmation) {
    req.flash(
      "error",
      "The new password does not match wtih a confirmation password."
    );
    return res
      .status(400)
      .render("users/change-password", { pageTitle: "Change Password" });
  }
  if (oldPassword === newPassword) {
    req.flash("error", "The new password is same with old password.");
    return res
      .status(400)
      .render("users/change-password", { pageTitle: "Change Password" });
  }

  user.password = newPassword;
  await user.save();
  req.flash("info", "Password updated");
  return res.redirect("/users/logout");
};

export const profile = async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id)
    .populate({
      path: "uploadVideos",
      populate: {
        path: "owner",
        model: "User",
      },
    })
    .populate({
      path: "likeVideos",
      populate: {
        path: "owner",
        model: "User",
      },
    });
  if (!user) {
    req.flash("error", "User not found.");
    return res.status(404).render("404", { pageTitle: "User not found." });
  }
  return res.render("users/profile", { pageTitle: `${user.name}`, user });
};

export const remove = (req, res) => res.send("Remove User");
