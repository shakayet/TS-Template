import { Chat } from './chat.model';
import { IMessage } from './chat.interface';

const saveMessageToDB = async (payload: IMessage) => {
  const result = await Chat.create(payload);
  return result.populate('sender', 'name email profile');
};

const getMessagesFromDB = async (
  page: number = 1,
  limit: number = 10
): Promise<{ messages: IMessage[]; total: number }> => {
  const skip = (page - 1) * limit;
  // Sort by createdAt descending (-1) to get newest first
  const result = await Chat.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('sender', 'name email profile');

  const total = await Chat.countDocuments();

  return {
    messages: result,
    total,
  };
};

export const ChatService = {
  saveMessageToDB,
  getMessagesFromDB,
};
