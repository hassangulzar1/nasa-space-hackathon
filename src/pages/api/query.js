// // pages/api/chatbot.js
// import { QdrantClient } from "qdrant-client"; // Ensure to install the Qdrant client for Node.js
// import { SentenceTransformer } from "sentence-transformers"; // Ensure to install sentence-transformers
// import { Groq } from "groq"; // Ensure to install the Groq client
//
// const qdrantClient = new QdrantClient({
//   url: "https://1c567b57-a9a3-4959-95a8-a20ce9b0f0d5.europe-west3-0.gcp.cloud.qdrant.io:6333",
//   apiKey: "ICfCrvnuKA10Swwy7giPRy3P6uQxKDn8dgefeNYpfIuqqV_j4ifE4w",
// });
//
// const model = new SentenceTransformer("paraphrase-MiniLM-L6-v2");
// const groqClient = new Groq({ apiKey: "your-groq-api-key" });
//
// export default async function handler(req, res) {
//   if (req.method === "POST") {
//     const { userQuery } = req.body;
//
//     // Call your Python logic here or translate it to JavaScript
//     // For example, you could directly call query_planet logic in JavaScript here.
//     const response = await queryPlanet(userQuery);
//
//     // Prepare the combined message
//     const combinedContent = `Context: ${response}\nUser's query: ${userQuery}`;
//
//     // Chat completion
//     const chatCompletion = await groqClient.chat.completions.create({
//       messages: [
//         {
//           role: "system",
//           content: "You are a helpful assistant for solar system questions.",
//         },
//         { role: "user", content: combinedContent },
//       ],
//       model: "llama3-8b-8192",
//       temperature: 0.5,
//       max_tokens: 1024,
//     });
//
//     const modelOutput = chatCompletion.choices[0].message.content;
//     res.status(200).json({ response: modelOutput });
//   } else {
//     res.setHeader("Allow", ["POST"]);
//     res.status(405).end(`Method ${req.method} Not Allowed`);
//   }
// }
