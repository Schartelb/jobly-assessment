"use strict";

/** Convenience middleware to handle common auth cases in routes. */

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const { UnauthorizedError, ExpressError } = require("../expressError");


/** Middleware: Authenticate user.
 *
 * If a token was provided, verify it, and, if valid, store the token payload
 * on res.locals (this will include the username and isAdmin field.)
 *
 * It's not an error if no token was provided or if the token is not valid.
 */

function authenticateJWT(req, res, next) {
  try {
    const authHeader = req.headers && req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace(/^[Bb]earer /, "").trim();
      res.locals.user = jwt.verify(token, SECRET_KEY);
    }
    return next();
  } catch (err) {
    return next();
  }
}

/** Middleware to use when they must be logged in.
 *
 * If not, raises Unauthorized.
 */

function ensureLoggedIn(req, res, next) {
  try {
    if (!res.locals.user) throw new UnauthorizedError();
    return next();
  } catch (err) {
    return next(err);
  }
}

function checkAdmin(req, res, next) {
  try {
    console.log(res.locals.user)
    if (res.locals.user==undefined || !res.locals.user.isAdmin) {
      checkHandle(req,res,next)
      throw new UnauthorizedError()
    }
    return next()
  } catch (err) {
    return next(err)
  }
}

function checkHandle(req,res,next) {
  try {
    if(res.locals.user){
    const token = req.headers.authorization.replace(/^[Bb]earer /, "").trim()
    const usertoken = jwt.decode(token, SECRET_KEY)
    if (req.params.username!==usertoken.username) throw new UnauthorizedError();}
    else{throw new UnauthorizedError()}
    return next()
  }catch(err){
    return next(err)
  }
}

module.exports = {
  authenticateJWT,
  ensureLoggedIn,
  checkAdmin
};
