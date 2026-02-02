import { Model, Types } from 'mongoose';

export type IMessage = {
  sender: Types.ObjectId;
  text?: string;
  images?: string[];
  pdf?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type ChatModel = Model<IMessage, Record<string, unknown>>;
