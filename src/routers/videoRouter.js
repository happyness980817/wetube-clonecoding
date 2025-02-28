import express from "express";
import { watch, getEdit, postEdit, getUpload, postUpload } from "../controllers/videoController";

const videoRouter = express.Router();

videoRouter.get("/:id([0-9a-f]{24})", watch);
videoRouter.route("/:id([0-9a-f]{24})/edit").get(getEdit).post(postEdit);
// videoRouter.get("/upload", getUpload);
// videoRouter.post("/upload", postUpload);
videoRouter.route("/upload").get(getUpload).post(postUpload); // 위에 두줄 쓰는거랑 동일기능

export default videoRouter;
