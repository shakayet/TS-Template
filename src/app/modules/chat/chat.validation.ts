import { z } from 'zod';

const sendMessageZodSchema = z.object({
  body: z.object({
    text: z.string().optional(),
  }),
});

export const ChatValidation = {
  sendMessageZodSchema,
};
