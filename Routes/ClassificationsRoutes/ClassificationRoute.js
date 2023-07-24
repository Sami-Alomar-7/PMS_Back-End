const express = require('express');
const router = express.Router();

// Routes
    const categoryRoute = require('./CategoryRoute');
    const typeRoute = require('./TypeRoute');
    const ScinceRoute = require('./scinceRoute');
    const RawCategoryRoute = require('./RawCategoryRoute');

router.use('/category', categoryRoute);

router.use('/type', typeRoute);

router.use('/scince', ScinceRoute);

router.use('/rawCategory', RawCategoryRoute);

module.exports = router;