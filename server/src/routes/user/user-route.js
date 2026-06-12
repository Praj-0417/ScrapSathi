const express = require("express")
const router = express.Router();
const authControllers = require("../../controllers/user/user-controller")
const { protect } = require("../../middlewares/authMiddleware")
const validate = require('../../middlewares/validate.middleware');
const { registerSchema, loginSchema, updatePasswordSchema } = require('../../validators/auth.validator');


router.route("/").get(authControllers.home)

router.route('/register').post(validate(registerSchema), authControllers.register)
router.route('/login').post(validate(loginSchema), authControllers.login)
router.route('/profile').get(protect, authControllers.getProfile)
router.route('/update-profile').patch(protect, authControllers.updateUserProfile)
router.route('/update').post(validate(updatePasswordSchema), authControllers.updatePassword)
router.route('/user').get(protect, authControllers.user)

module.exports = router;
