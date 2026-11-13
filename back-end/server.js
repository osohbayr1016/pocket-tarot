"use strict";

/**
 * Compatibility server for old deployments. Pocket Tarot v2 is local-first and
 * does not need a backend, accounts, sessions, databases, or generative AI.
 * Deliberately do NOT mount the previous unaudited authentication, AI, or
 * readings routes: the old code mixed MongoDB-style queries with Sequelize
 * models and exposed credential metadata. Fail closed rather than expose data.
 */
const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const app = express();
app.disable("x-powered-by");
app.use(helmet());
app.use(rateLimit({windowMs: 15*60*1000, max: 120, standardHeaders: "draft-7", legacyHeaders: false}));
app.get("/api/health", (_req,res) => {
  res.set("Cache-Control","no-store");
  res.status(200).json({status:"OK", mode:"offline-first", backend:"deprecated"});
});
app.use("/api", (_req,res) => {
  res.set("Cache-Control","no-store");
  res.status(410).json({
    success:false,
    error:"Legacy API disabled",
    message:"Pocket Tarot now runs locally; use the frontend instead."
  });
});
app.use((_req,res) => res.status(404).json({error:"Not found"}));

if (require.main === module) {
  const port = Number(process.env.PORT) || 5001;
  app.listen(port, () => console.log("Pocket Tarot compatibility health server on port " + port));
}
module.exports = app;
