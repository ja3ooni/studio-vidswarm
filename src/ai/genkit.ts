
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
// Example: Import the OpenAI plugin if you were to use it.
// import {openai} from 'genkitx-openai'; // Assuming a hypothetical community plugin

export const ai = genkit({
  plugins: [
    googleAI(),
    // Example: Add OpenAI plugin configuration.
    // You would need to install the plugin (e.g., `npm install genkitx-openai`)
    // and configure it with your API key, typically via environment variables.
    // openai({apiKey: process.env.OPENAI_API_KEY}),
  ],
  // You can set a default model, but flows can override this.
  model: 'googleai/gemini-2.0-flash', 
  // You could also define multiple models and reference them by name in flows:
  // models: {
  //   gemini: googleAI({ model: 'gemini-2.0-flash' }),
  //   gpt4: openai({ model: 'gpt-4' }) 
  // }
});
