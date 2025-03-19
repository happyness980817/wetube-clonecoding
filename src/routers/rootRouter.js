import express from "express";
import { getJoin, postJoin, getLogin, postLogin } from "../controllers/userController";
import { home, search } from "../controllers/videoController";
import { publicOnlyMiddleware } from "../middlewares";

const rootRouter = express.Router();

rootRouter.get("/", home);
rootRouter.route("/join").all(publicOnlyMiddleware).get(getJoin).post(postJoin); // logout 된 사람들만 접근 가능
rootRouter.route("/login").all(publicOnlyMiddleware).get(getLogin).post(postLogin); // logout 된 사람들만 접근 가능
rootRouter.get("/search", search);

export default rootRouter;
