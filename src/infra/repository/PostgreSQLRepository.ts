import { Chat } from "../../domain/entity/Chat";
import { Message } from "../../domain/entity/Message";
import { Model } from "../../domain/entity/Model";
import { ChatRepository } from "../../domain/repository/ChatRepository";
import { Either, left, right } from "../../shared/either";
import {
  AddMessageParams,
  CreateChatParams,
  UpdateChatParams,
} from "../db/models/DatabaseModels";
import { postgreSQLDatabase } from "../db/postgresql/postgresql-database";

export class PostgreSQLRepository implements ChatRepository {
  async createChat(chat: Chat): Promise<Either<Error, Chat>> {
    let err: Error;
    const chatPayload: CreateChatParams = {
      frequency_penalty: chat.config.frequencyPenalty,
      id: chat.id,
      initial_message_id: chat.initialSystemMessage.id,
      max_tokens: chat.config.model.maxTokens,
      model: chat.config.model.name,
      model_max_tokens: chat.config.model.maxTokens,
      n: chat.config.n,
      presence_penalty: chat.config.presencePenalty,
      status: chat.status,
      stop: chat.config.stop.join(""),
      temperature: chat.config.temperature,
      token_usage: chat.tokenUsage,
      top_p: chat.config.topP,
      created_at: new Date(),
      updated_at: new Date(),
      user_id: chat.userId,
    };
    const createdChatOrError = await postgreSQLDatabase.createChat(chatPayload);
    if (createdChatOrError.isLeft()) {
      err = createdChatOrError.value;
      return left(new Error("error creating chat: " + err.message));
    }
    const initialMessagePayload: AddMessageParams = {
      chat_id: chat.id,
      content: chat.initialSystemMessage.content,
      created_at: chat.initialSystemMessage.createdAt,
      erased: false,
      id: chat.initialSystemMessage.id,
      model: chat.initialSystemMessage.model,
      order_msg: 0,
      role: chat.initialSystemMessage.role,
      tokens: chat.initialSystemMessage.tokens,
    };
    const addedMessageOrError = await postgreSQLDatabase.addMessage(
      initialMessagePayload
    );
    if (addedMessageOrError.isLeft()) {
      err = addedMessageOrError.value;
      return left(
        new Error("error saving message when creating chat: " + err.message)
      );
    }
    return right(chat);
  }

  async updateChat(chat: Chat): Promise<Either<Error, Chat>> {
    let err: Error;
    const chatPayload: UpdateChatParams = {
      frequency_penalty: chat.config.frequencyPenalty,
      id: chat.id,
      initial_message_id: chat.initialSystemMessage.id,
      max_tokens: chat.config.model.maxTokens,
      model: chat.config.model.name,
      model_max_tokens: chat.config.model.maxTokens,
      n: chat.config.n,
      presence_penalty: chat.config.presencePenalty,
      status: chat.status,
      stop: chat.config.stop.join(" "),
      temperature: chat.config.temperature,
      token_usage: chat.tokenUsage,
      top_p: chat.config.topP,
      updated_at: new Date(),
      user_id: chat.userId,
    };
    const chatSavedOrError = await postgreSQLDatabase.updateChat(chatPayload);
    if (chatSavedOrError.isLeft()) {
      err = chatSavedOrError.value;
      return left(new Error("error saving chat: " + err.message));
    }
    const deletedMessagesOrError = await postgreSQLDatabase.deleteChatMessages(
      chat.id
    );
    if (deletedMessagesOrError.isLeft()) {
      err = deletedMessagesOrError.value;
      return left(new Error("error deleting chat messages: " + err.message));
    }
    const deletedErasedMessagesOrError =
      await postgreSQLDatabase.deleteErasedChatMessages(chat.id);
    if (deletedErasedMessagesOrError.isLeft()) {
      err = deletedErasedMessagesOrError.value;
      return left(
        new Error("error deleting erased chat messages: " + err.message)
      );
    }
    for (let i = 0; i < chat.messages.length; i++) {
      const messagePayload = {
        id: chat.messages[i].id,
        chat_id: chat.id,
        content: chat.messages[i].content,
        created_at: chat.messages[i].createdAt,
        erased: false,
        model: chat.messages[i].model,
        order_msg: i + 1,
        role: chat.messages[i].role,
        tokens: chat.messages[i].tokens,
      } as AddMessageParams;
      const addedMessagesOrError = await postgreSQLDatabase.addMessage(
        messagePayload
      );
      if (addedMessagesOrError.isLeft()) {
        err = addedMessagesOrError.value;
        return left(
          new Error("error adding messages to saved chat: " + err.message)
        );
      }
    }
    for (let i = 0; i < chat.erasedMessages.length; i++) {
      const messagePayload = {
        chat_id: chat.id,
        content: chat.erasedMessages[i].content,
        created_at: chat.erasedMessages[i].createdAt,
        erased: true,
        id: chat.erasedMessages[i].id,
        model: chat.erasedMessages[i].model,
        order_msg: i,
        role: chat.erasedMessages[i].role,
        tokens: chat.erasedMessages[i].tokens,
      } as AddMessageParams;
      const addedMessagesOrError = await postgreSQLDatabase.addMessage(
        messagePayload
      );
      if (addedMessagesOrError.isLeft()) {
        err = addedMessagesOrError.value;
        return left(
          new Error(
            "error adding erased messages to saved chat: " + err.message
          )
        );
      }
    }
    return right(chat);
  }

  async findChatById(chatId: string): Promise<Either<Error, Chat>> {
    let err: Error;
    const chatFoundOrError = await postgreSQLDatabase.findChatById(chatId);
    if (chatFoundOrError.isLeft()) {
      err = chatFoundOrError.value;
      return left(new Error("error finding chat: " + err.message));
    }
    const chatFound = chatFoundOrError.value;
    if (!chatFound) {
      return left(new Error("chat not found"));
    }
    const messagesOrError = await postgreSQLDatabase.findMessagesByChatId(
      chatFound.id
    );
    if (messagesOrError.isLeft()) {
      err = messagesOrError.value;
      return left(new Error("error finding messages: " + err.message));
    }
    const messages = messagesOrError.value;
    const initialMessageIndex = messages.findIndex((m) => {
      return m.id === chatFound.initial_message_id;
    });
    const initialMessage = messages.splice(initialMessageIndex, 1)[0];
    const erasedMessagesOrError =
      await postgreSQLDatabase.findErasedMessagesByChatId(chatFound.id);
    if (erasedMessagesOrError.isLeft()) {
      err = erasedMessagesOrError.value;
      return left(new Error("error finding erased messages: " + err.message));
    }
    const erasedMessages = erasedMessagesOrError.value;
    const model = Model.create(chatFound.model, chatFound.model_max_tokens)
      .value as Model;
    const initialSystemMessage = Message.create(
      "system",
      initialMessage.content,
      model,
      initialMessage.id,
      initialMessage.created_at
    ).value as Message;
    const chat = Chat.create(
      chatFound.user_id,
      initialSystemMessage,
      {
        frequencyPenalty: Math.floor(chatFound.frequency_penalty * 100) / 100,
        model: model,
        n: chatFound.n,
        presencePenalty: Math.floor(chatFound.presence_penalty * 100) / 100,
        stop: chatFound.stop.split(",").filter((val) => val !== ""),
        temperature: Math.floor(chatFound.temperature * 100) / 100,
        topP: Math.floor(chatFound.top_p * 100) / 100,
        maxTokens: chatFound.max_tokens,
      },
      chatFound.id
    ).value as Chat;
    messages.forEach((m) => {
      const message = Message.create(
        m.role,
        m.content,
        model,
        m.id,
        m.created_at
      ).value as Message;
      chat.addMessage(message);
    });
    erasedMessages.forEach((m) => {
      const message = Message.create(
        m.role,
        m.content,
        model,
        m.id,
        m.created_at
      ).value as Message;
      chat.addErasedMessage(message);
    });
    return right(chat);
  }
}
