import { OpenAIApi, Configuration } from "openai";

const openAIClient = {
  client: null as unknown as OpenAIApi,

  setup(key: string): void {
    const config = new Configuration({ apiKey: key });
    this.client = new OpenAIApi(config);
  },
};

export default openAIClient;
