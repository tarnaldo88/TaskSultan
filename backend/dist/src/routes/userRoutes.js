"use strict";
// Routes (add as needed)
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/me', auth_1.requireAuth, userController_1.getCurrentUser);
router.put('/me', auth_1.requireAuth, userController_1.updateCurrentUser);
router.delete('/me', auth_1.requireAuth, userController_1.deleteCurrentUser);
exports.default = router;
