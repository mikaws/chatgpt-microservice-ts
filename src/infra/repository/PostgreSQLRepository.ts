import { Chat } from "../../domain/entity/Chat";
import { Message, TMessage } from "../../domain/entity/Message";
import { Model } from "../../domain/entity/Model";
import { ChatRepository } from "../../domain/repository/ChatRepository";
import { Either, left, right } from "../../shared/either";
import {
  AddMessageParams,
  CreateChatParams,
  SaveChatParams,
} from "../db/models/DatabaseModels";
import { postgreSQLDatabase } from "../db/postgresql/postgresql-database";

export class PostgreSQLRepository implements ChatRepository {
  async createChat(chat: Chat): Promise<Either<Error, Chat>> {
    let err: Error;
    const chatPayload: CreateChatParams = {
      FrequencyPenalty: chat.config.frequencyPenalty,
      ID: chat.id,
      InitialMessageID: chat.initialSystemMessage.id,
      MaxTokens: chat.config.maxTokens,
      Model: chat.config.model.name,
      ModelMaxTokens: chat.config.model.maxTokens,
      N: chat.config.n,
      PresencePenalty: chat.config.presencePenalty,
      Status: chat.status,
      Stop: chat.config.stop[0],
      Temperature: chat.config.temperature,
      TokenUsage: chat.tokenUsage,
      TopP: chat.config.topP,
      CreatedAt: new Date(),
      UpdatedAt: new Date(),
      UserID: chat.userId,
    };
    const createdChatOrError = await postgreSQLDatabase.createChat(chatPayload);
    if (createdChatOrError.isLeft()) {
      err = createdChatOrError.value;
      return left(new Error("error creating chat: " + err));
    }
    const initialMessagePayload: AddMessageParams = {
      ChatID: chat.id,
      Content: chat.initialSystemMessage.content,
      CreatedAt: new Date(),
      Erased: false,
      ID: chat.initialSystemMessage.id,
      Model: chat.initialSystemMessage.model.name,
      OrderMsg: 0,
      Role: chat.initialSystemMessage.role,
      Tokens: chat.initialSystemMessage.tokens,
    };
    const addedMessageOrError = await postgreSQLDatabase.addMessage(
      initialMessagePayload
    );
    if (addedMessageOrError.isLeft()) {
      err = addedMessageOrError.value;
      return left(new Error("error adding message in created chat: " + err));
    }
    return right(chat);
  }

  async saveChat(chat: Chat): Promise<Either<Error, Chat>> {
    try {
      const chatPayload: SaveChatParams = {
        FrequencyPenalty: chat.config.frequencyPenalty,
        ID: chat.id,
        InitialMessageID: chat.initialSystemMessage.id,
        MaxTokens: chat.config.maxTokens,
        Model: chat.config.model.name,
        ModelMaxTokens: chat.config.model.maxTokens,
        N: chat.config.n,
        PresencePenalty: chat.config.presencePenalty,
        Status: chat.status,
        Stop: chat.config.stop[0],
        Temperature: chat.config.temperature,
        TokenUsage: chat.tokenUsage,
        TopP: chat.config.topP,
        UpdatedAt: new Date(),
        UserID: chat.userId,
      };
      let err = await postgreSQLDatabase.saveChat(chatPayload);
      if (err.isLeft()) {
        return left(new Error("error saving chat: " + err));
      }
      err = await postgreSQLDatabase.deleteChatMessages(chat.id);
      if (err.isLeft()) {
        return left(new Error("error deleting chat messages: " + err));
      }
      err = await postgreSQLDatabase.deleteErasedChatMessages(chat.id);
      if (err.isLeft()) {
        return left(new Error("error deleting erased chat messages: " + err));
      }
      for (let i = 0; i < chat.messages.length; i++) {
        const messagePayload = {
          ChatID: chat.id,
          Content: chat.messages[i].content,
          CreatedAt: new Date(),
          Erased: false,
          ID: chat.messages[i].id,
          Model: chat.messages[i].model.name,
          OrderMsg: i,
          Role: chat.messages[i].role,
          Tokens: chat.messages[i].tokens,
        } as AddMessageParams;
        err = await postgreSQLDatabase.addMessage(messagePayload);
        if (err.isLeft()) {
          return left(new Error("error adding messages to saved chat: " + err));
        }
      }
      for (let i = 0; i < chat.erasedMessages.length; i++) {
        const messagePayload = {
          ChatID: chat.id,
          Content: chat.erasedMessages[i].content,
          CreatedAt: new Date(),
          Erased: true,
          ID: chat.erasedMessages[i].id,
          Model: chat.erasedMessages[i].model.name,
          OrderMsg: i,
          Role: chat.erasedMessages[i].role,
          Tokens: chat.erasedMessages[i].tokens,
        } as AddMessageParams;
        await postgreSQLDatabase.addMessage(messagePayload);
        if (err.isLeft()) {
          return left(
            new Error("error adding erased messages to saved chat: " + err)
          );
        }
      }
      return right(chat);
    } catch (err) {
      return left(err as Error);
    }
  }

  async findChatById(chatId: string): Promise<Either<Error, Chat>> {
    try {
      let err: Error;
      const chatFoundOrError = await postgreSQLDatabase.findChatByID(chatId);
      if (chatFoundOrError.isLeft()) {
        err = chatFoundOrError.value;
        return left(new Error("error finding chat: " + err));
      }
      const chatFound = chatFoundOrError.value;
      if (!chatFound) {
        return left(new Error("chat not found"));
      }
      const messagesOrError = await postgreSQLDatabase.findMessagesByChatID(
        chatFound.ID
      );
      if (messagesOrError.isLeft()) {
        err = messagesOrError.value;
        return left(new Error("error finding messages: " + err));
      }
      const messages = messagesOrError.value;
      const initialMessageIndex = messages.findIndex((m) => {
        return m.ID === chatFound.InitialMessageID;
      });
      const initialMessage = messages.splice(initialMessageIndex)[0];
      const erasedMessagesOrError =
        await postgreSQLDatabase.findErasedMessagesByChatID(chatFound.ID);
      if (erasedMessagesOrError.isLeft()) {
        err = erasedMessagesOrError.value;
        return left(new Error("error finding erased messages: " + err));
      }
      const erasedMessages = erasedMessagesOrError.value;
      const chat = new Chat({
        id: chatFound.ID,
        config: {
          frequencyPenalty: chatFound.FrequencyPenalty,
          maxTokens: chatFound.MaxTokens,
          model: Model.create(chatFound.Model, chatFound.ModelMaxTokens)
            .value as Model,
          n: chatFound.N,
          presencePenalty: chatFound.PresencePenalty,
          stop: [chatFound.Stop],
          temperature: chatFound.Temperature,
          topP: chatFound.TopP,
        },
        initialSystemMessage: new Message({
          id: initialMessage.ID,
          content: initialMessage.Content,
          model: new Model(initialMessage.Model, chatFound.ModelMaxTokens), // maxTokens is wrong
          createdAt: initialMessage.CreatedAt,
          role: "system",
          tokens: initialMessage.Tokens,
        } as TMessage),
        erasedMessages: erasedMessages.map((eM) => {
          return Message.create(
            eM.Role as "user" | "system" | "assistant",
            eM.Content,
            Model.create(eM.Model, eM.Tokens).value as Model
          ).value as Message;
        }),
        messages: messages.map((m) => {
          return new Message({
            id: m.ID,
            content: m.Content,
            createdAt: m.CreatedAt,
            model: new Model(m.Model, chatFound.ModelMaxTokens),
            role: m.Role,
            tokens: m.Tokens,
          } as TMessage);
        }),
        status: chatFound.Status,
        tokenUsage: chatFound.TokenUsage,
        userId: chatFound.UserID,
      });
      return right(chat);
    } catch (err) {
      return left(err as Error);
    }
  }
}
