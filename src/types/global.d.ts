// suppress missing module error from Google GenAI types
// the generated declaration references a dependency that isn't installed
// create a relaxed declaration so TypeScript stops complaining.

declare module '@modelcontextprotocol/sdk/client/index.js';
