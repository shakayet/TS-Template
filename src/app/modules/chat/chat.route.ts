import express from 'express';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import { ChatController } from './chat.controller';
import validateRequest from '../../middlewares/validateRequest';
import { ChatValidation } from './chat.validation';

const router = express.Router();

router.post(
  '/send',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  fileUploadHandler(),
  (req, res, next) => {
    // Manually parsing body if needed or Zod just works on req.body
    if(req.body.data) {
        try {
            req.body = JSON.parse(req.body.data);
        } catch (error) {
             // If not JSON, leave as is (e.g. plain text text field)
        }
    }
    next();
  },
  validateRequest(ChatValidation.sendMessageZodSchema),
  ChatController.sendMessage
);

router.get(
  '/messages',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  ChatController.getMessages
);

export const ChatRoutes = router;
