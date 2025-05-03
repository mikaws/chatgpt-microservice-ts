# ChatGPT Microservice (TypeScript, Clean Architecture)

This project is a microservice for chat completions using the OpenAI API, following Clean Architecture principles. It stores chat sessions and messages in PostgreSQL and exposes a REST API for creating and continuing chats.

---

## Features

- Create new chat sessions or continue existing ones
- Stores chat and message history in PostgreSQL
- Clean, testable architecture
- 100% code coverage in tests

---

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- Docker & Docker Compose
- OpenAI API key

---

### 1. Clone the Repository

```sh
git clone https://github.com/yourusername/chatgpt-microservice-ts.git
cd chatgpt-microservice-ts
```

---

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```env
OPENAI_API_KEY=your-openai-api-key
...
```

---

### 3. Start PostgreSQL with Docker Compose

```sh
docker compose up -d --build
```

This will start a PostgreSQL 15 container and initialize the schema.

---

### 4. Install Dependencies

```sh
npm install
```

---

### 5. Run the Service

```sh
npm run start
```

The API will be available at `http://localhost:SERVER_PORT`.

---

## API Usage

### **POST api/chat/completion**

Create a new chat or continue an existing one.

#### **Request Body**

```json
{
  "chatId": "chat-id",      // set a uuid to start a chat
  "userId": "user-uuid",
  "userMessage": "Hello, how are you?",
  "config": {
    "model": "gpt-3.5-turbo",
    "max_tokens": 100,
    "temperature": 0.7,
    "stop": ["super-end"]
  }
}
```

- `chatId`: Provide to continue an existing chat.
- `userId`: Your user identifier.
- `userMessage`: The message to send.
- `config`: (Optional) Chat configuration (model, tokens, etc.).

#### **Response**

```json
{
  "chatId": "uuid-of-chat",
  "messages": [
    { "role": "system", "content": "..." },
    { "role": "user", "content": "Hello, how are you?" },
    { "role": "assistant", "content": "I'm fine, thank you!" }
  ]
}
```

- `chatId`: Use this for subsequent requests to continue the conversation.
- `messages`: Full chat history.

---

## Example: Continue a Chat

1. **Start a new chat** (omit `chatId`).
2. **Use the returned `chatId`** for the next message.

---

## Running Tests

```sh
npm test
```

---

## Project Structure

- `src/domain` — Entities, use cases, repository interfaces
- `src/infra` — DB, API adapters, migrations
- `src/app` — Controllers, server setup

---

## Troubleshooting

- If you get `relation "chats" does not exist`, ensure your migrations ran. Try:
  ```sh
  docker compose down -v
  docker compose up -d --build
  ```
- Ensure your `.env` values are valid JSON where required (e.g., `STOP`).
- If you see a deprecation warning related to `punycode` there is nothing to do. It is a problem for the `openai`npm package and its dependencies (specifically the dependency tr46 which uses the deprecated punycode module).

---

## Authors

- Michael Dias - mikaws

---

## License

MIT