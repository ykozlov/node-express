'use strict';

import {Router} from 'express';
import * as controller from './thing.controller.js';
var router = new Router();

router.get('/', controller.index);
router.post('/', controller.create);

module.exports = router;
