import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { ChatService } from './chat.service';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import fs from 'fs';

// Helper to remove files
const removeFiles = (files: { [fieldname: string]: Express.Multer.File[] }) => {
    Object.values(files).flat().forEach(file => {
        if(fs.existsSync(file.path)){
            fs.unlinkSync(file.path);
        }
    });
};

const sendMessage = catchAsync(async (req: Request, res: Response) => {
  const user = req.user; 
  const { text } = req.body;
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  const images = files?.['image'] || [];
  const docs = files?.['doc'] || [];

  // 1. Validate PDF count
  if (docs.length > 1) {
    removeFiles(files);
    throw new ApiError(StatusCodes.BAD_REQUEST, 'You can only upload 1 PDF file');
  }

  // 2. Validate Images count
  if (images.length > 3) {
     removeFiles(files);
     throw new ApiError(StatusCodes.BAD_REQUEST, 'You can only upload up to 3 images');
  }

  // 3. Validate Total Image Size (Max 10MB)
  const totalImageSize = images.reduce((sum, img) => sum + img.size, 0);
  const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
  if (totalImageSize > MAX_IMAGE_SIZE) {
    removeFiles(files);
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Total image size must not exceed 10 MB');
  }

  const imagePaths = images.map(file => `/uploads/image/${file.filename}`);
  const pdfPath = docs.length > 0 ? `/uploads/doc/${docs[0].filename}` : undefined;

  const payload = {
    sender: (user as any).id,
    text,
    images: imagePaths,
    pdf: pdfPath,
  };

  const result = await ChatService.saveMessageToDB(payload);

  // Emit Socket Event
  // @ts-ignore
  if (global.io) {
    // @ts-ignore
    global.io.emit('new-message', result);
  }

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Message sent successfully',
    data: result,
  });
});

const getMessages = catchAsync(async (req: Request, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const result = await ChatService.getMessagesFromDB(page, limit);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Messages retrieved successfully',
        data: result,
    });
});

export const ChatController = {
  sendMessage,
  getMessages,
};
