import { Schema, model } from 'mongoose';
import { ChatModel, IMessage } from './chat.interface';

const chatSchema = new Schema<IMessage, ChatModel>(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
    },
    images: {
      type: [String],
      default: [],
    },
    pdf: {
      type: String,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  }
);

export const Chat = model<IMessage, ChatModel>('Chat', chatSchema);
