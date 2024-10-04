// pages/api/query.js

import * as tf from "@tensorflow/tfjs";
import { load as loadUniversalSentenceEncoder } from "@tensorflow-models/universal-sentence-encoder";
import { QdrantClient } from "@qdrant/js-client-rest";
import { cosineSimilarity } from "ml-distance";

let model;

async function loadModel() {
  if (!model) {
    model = await loadUniversalSentenceEncoder();
  }
}

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { queryText } = req.body;

    if (!queryText) {
      return res.status(400).json({ message: "No query text provided." });
    }

    await loadModel(); // Ensure the model is loaded

    try {
      const qdrantClient = new QdrantClient({
        url: "https://1c567b57-a9a3-4959-95a8-a20ce9b0f0d5.europe-west3-0.gcp.cloud.qdrant.io:6333", // Replace with your Qdrant URL
        apiKey: "ICfCrvnuKA10Swwy7giPRy3P6uQxKDn8dgefeNYpfIuqqV_j4ifE4w", // Replace with your Qdrant API key
      });

      // Encode the query into a vector
      const queryEmbedding = await model.embed(queryText);
      const queryVector = queryEmbedding.arraySync()[0]; // Convert tensor to array

      // Search for the most similar vectors
      const searchResults = await qdrantClient.search({
        collection_name: "planets", // Replace with your collection name
        query_vector: queryVector,
        limit: 1,
      });

      if (!searchResults || searchResults.length === 0) {
        return res.status(404).json({ message: "No results found." });
      }

      const closestMatch = searchResults[0];
      return res.status(200).json({ answer: closestMatch.payload });
    } catch (error) {
      console.error("Error during API processing:", error);
      return res.status(500).json({ message: "Server error." });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    return res
      .status(405)
      .json({ message: `Method ${req.method} Not Allowed` });
  }
}
