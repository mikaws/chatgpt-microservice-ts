import { OpenAI } from "openai";

const openAIClient = {
  client: null as unknown as OpenAI,

  setup(key: string): void {
    this.client = new OpenAI({ apiKey: key });
  },
};

export default openAIClient;
