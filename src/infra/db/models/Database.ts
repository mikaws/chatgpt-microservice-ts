export interface Database<T> {
  pool: T;
  connect(dbConfig: DBConfig): Promise<void>;
  disconnect(): Promise<void>;
  createChat(chat: CreateChatParams): Promise<void>;
  addMessage(message: AddMessageParams): Promise<void>;
  findChatByID(id: string): Promise<Chat | null>;
  findMessagesByChatID(chatID: string): Promise<Message[]>;
  findErasedMessagesByChatID(chatID: string): Promise<Message[]>;
  saveChat(params: SaveChatParams): Promise<void>;
  deleteChatMessages(chatID: string): Promise<void>;
  deleteErasedChatMessages(chatID: string): Promise<void>;
};
