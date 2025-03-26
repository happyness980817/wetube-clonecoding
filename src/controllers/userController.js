import User from "../models/User";
import fetch from "node-fetch";
import bcrypt from "bcrypt";

export const getJoin = (req, res) => res.render("join", { pageTitle: "Join" });

export const postJoin = async (req, res) => {
  const { name, username, email, password, password2, location } = req.body;
  const pageTitle = "Join";
  if (password !== password2) {
    return res.status(400).render("join", {
      pageTitle,
      errorMessage: "Password confirmation does not match.",
    });
  }
  const exists = await User.exists({ $or: [{ username }, { email }] });
  if (exists) {
    return res.status(400).render("join", {
      pageTitle,
      errorMessage: "This username/email is already taken.",
    });
  }
  try {
    await User.create({
      name,
      username,
      email,
      password,
      location,
    });
    return res.redirect("/login");
  } catch (error) {
    return res.status(400).render("join", {
      pageTitle: "Upload Video",
      errorMessage: error._message,
    });
  }
};

export const getLogin = (req, res) => res.render("login", { pageTitle: "LogIn" });

export const postLogin = async (req, res) => {
  const { username, password } = req.body;
  const pageTitle = "LogIn";
  const user = await User.findOne({ username, socialOnly: false });
  if (!user) {
    return res.status(400).render("login", {
      pageTitle,
      errorMessage: "An account with this username does not exist.",
    });
  } // check if account exists
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    return res.status(400).render("login", {
      pageTitle,
      errorMessage: "Wrong Password.",
    });
  } // check if password is correct
  req.session.loggedIn = true;
  req.session.user = user;
  return res.redirect("/");
};

export const startGithubLogin = (req, res) => {
  const baseUrl = `https://github.com/login/oauth/authorize`;
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
    const emailObj = emailData.find((email) => email.primary === true && email.verified === true);
    if (!emailObj) {
      return res.redirect("/login");
    }
    let user = await User.findOne({ email: emailObj.email });
    if (!user) {
      user = await User.create({
        avatarUrl: userData.avatar_url,
        name: userData.name,
        username: userData.login,
        email: emailObj.email,
        password: "",
        socialOnly: true,
        location: userData.location,
      });
    } // 계정 생성
    req.session.loggedIn = true;
    req.session.user = user;
    return res.redirect("/");
  } else {
    return res.redirect("/login");
  }
};

export const logout = (req, res) => {
  req.session.destroy();
  return res.redirect("/");
};
export const getEdit = (req, res) => {
  return res.render("edit-profile", { pageTitle: "Edit Profile" });
};
export const postEdit = async (req, res) => {
  const {
    session: { user },
    body: { name, email, username, location },
    file,
  } = req;

  /* 
  const user = req.session.user;
  const name = req.body.name;
  const email = req.body.email;
  const username = req.body.username;
  const location = req.body.location;
  const file = req.file;
  */

  const { _id, avatarUrl, username: currentUsername, email: currentEmail } = user;

  /*  
  const _id = user._id;
  const avatarUrl = user.avatarUrl;
  const currentUsername = user.username;
  const currentEmail = user.email; 
  */

  const usernameExists = username !== currentUsername ? await User.exists({ username }) : false;
  const emailExists = email !== currentEmail ? await User.exists({ email }) : false;

  if (usernameExists) {
    console.log("error");
    return res.status(400).render("edit-profile", {
      pageTitle: "Edit Profile",
      errorMessage: "This username is already taken.",
    });
  }

  if (emailExists) {
    console.log("error");
    return res.status(400).render("edit-profile", {
      pageTitle: "Edit Profile",
      errorMessage: "This email is already taken.",
    });
  }

  const updatedUser = await User.findByIdAndUpdate(
    _id,
    {
      avatarUrl: file ? `/${file.path}` : avatarUrl,
      name,
      email,
      username,
      location,
    },
    { new: true }
  );

  req.session.user = {
    ...user,
    name: updatedUser.name,
    email: updatedUser.email,
    username: updatedUser.username,
    location: updatedUser.location,
    avatarUrl: updatedUser.avatarUrl,
  };

  return res.redirect("/users/edit");
};

export const getChangePassword = (req, res) => {
  if (req.session.user.socialOnly === true) {
    return res.redirect("/");
  }
  return res.render("users/change-password", { pageTitle: "Change Password" });
};

export const postChangePassword = async (req, res) => {
  const {
    session: {
      user: { _id, password },
    },
    body: { oldPassword, newPassword, newPasswordConfirmation },
  } = req;
  const ok = await bcrypt.compare(oldPassword, password);
  if (!ok) {
    return res.status(400).render("users/change-password", {
      pageTitle: "Change Password",
      errorMessage: "Password does not match the previous one.",
    });
  }
  if (newPassword !== newPasswordConfirmation) {
    return res.status(400).render("users/change-password", {
      pageTitle: "Change Password",
      errorMessage: "Password does not match the confirmation.",
    });
  }
  const user = await User.findById(_id);
  user.password = newPassword;
  await user.save();
  req.session.user.password = user.password; // 이 부분이 없으면, 비밀번호를 한번 바꾸고 다시 바꾸려 할 때, 세션에는 새로 변경된 비밀번호 정보가 없기 때문에 does not match 오류 발생.
  // 원래는 logout 시키면 session 이 destroy 되어서 필요가 없는데, server.js 파일에서 session data 를 db 에 저장해서 불러오므로 이 코드 필요.
  return res.redirect("/users/logout");
};

export const see = (req, res) => res.send("See User");

// 내가 소셜로그인을 구현할 거라면...
// 이메일로 가입했는데 소셜로그인으로 로그인하려 한다 -> "동일한 이메일로 등록된 계정이 존재합니다."

// 맨 처음에 social login 으로 계정을 생성한 사람은 이메일로 로그인 불가능. password="" 로 설정되었으므로
// 자동으로 로그인시켜주는게 편할수도 있는데 예상못한데서 꼬일까봐 뭔가 찝찝하다.
