import { Chat } from "../../domain/entity/Chat";
import { Model } from "../../domain/entity/Model";
import { ChatRepository } from "../../domain/repository/ChatRepository";
import { Either, left, right } from "../../shared/either";
export class PostgreSQLRepository implements ChatRepository {
  constructor() {}

  createChat(chat: Chat): Either<Error, Chat> {
    if (chat.id === "erro") return left(new Error("a"));
    return right(chat);
  }

  saveChat(chat: Chat): Either<Error, Chat> {
    if (chat.id === "erro") return left(new Error("a"));
    return right(chat);
  }

  async findChatById(chatId: string): Promise<Either<Error, Chat>> {
    try {
      const res = await (await pool).findChatByID(chatId);
      if (res === null) throw new Error("chat not found");
      const chat = new Chat({
        id: res.ID,
        config: {
          frequencyPenalty: res.FrequencyPenalty,
          maxTokens: res.MaxTokens,
          model: Model.create(res.Model, res.ModelMaxTokens).value as Model,
          n: res.N,
          presencePenalty: res.PresencePenalty,
          stop: [res.Stop],
          temperature: res.Temperature,
          topP: res.TopP,
        },
        initialSystemMessage: res.InitialMessageID|
      });
      return right(chat.value);
    } catch (err) {
      return left(err);
    }
  }
}
