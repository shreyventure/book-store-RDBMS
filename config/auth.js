const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  } else {
    req.flash("error_msg", "Please log in to view that resource");
    res.redirect("/products/login");
  }
};

const forwardAuthenticated = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return next();
  } else {
    res.redirect("/products/dev/dashboard");
  }
};

module.exports = {
  ensureAuthenticated,
  forwardAuthenticated,
};
