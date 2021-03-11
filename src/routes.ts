import {request, Router} from 'express';
import { SendMailController } from './controllers/SendMailController';
import { SurveyController } from './controllers/SurveyController';
import {UserController} from './controllers/UserController';

const router = Router();

const userController = new UserController;
const surveyController = new SurveyController;
const sendMailController = new SendMailController;

router.post("/user", userController.create);
router.post("/survey", surveyController.create)
router.get("/survey",surveyController.show);
router.post("/send", sendMailController.execute);

export {router};