import { OpenAIApi } from "openai";

export const openAIClient = {
  client: null as unknown as OpenAIApi,

  setup(key: string): void {
    this.client = new OpenAIApi({
      apiKey: key,
      isJsonMime(mime = "application/json") {
        return true;
      },
    });
  },
};
