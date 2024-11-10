const RouteController = require("../controllers/routeController");
const router = require("express").Router();

router.post("/route", RouteController.createRoute)

module.exports = router;
