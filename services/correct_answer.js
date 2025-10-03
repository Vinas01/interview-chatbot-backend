import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatGroq } from "@langchain/groq";
import dotenv from "dotenv";
import { SystemMessage, HumanMessage, AIMessage, ToolMessage } from "@langchain/core/messages";
import { get_correct_answer_prompt } from "../prompts/correct_answer_prompts.js";
import path from "path";
import z from "zod";

dotenv.config({ path: path.join(process.cwd(), '.env') });

const gemini_llm = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    temperature: 0.7,
    maxRetries: 2,
    apiKey: process.env.GOOGLE_CLOUD_API_KEY
});

const groq_llm = new ChatGroq({
    model: "openai/gpt-oss-120b",
    temperature: 0.7,
    maxRetries: 2,
    apiKey: process.env.GROQ_API_KEY
});

const groq_answer_schema = z.string().describe(
    "The correct answer to the given question. " +
    "Always return the answer as a string. " +
    "Do not include extra formatting, or placeholders. " +
    "If the answer cannot be determined, return an empty string."
)

const gemini_answer_schema = {
    type: "string",
    description:
        "The correct answer to the given question. " +
        "Always return the answer as a plain string. " +
        "Do not include explanations, extra formatting, or placeholders. " +
        "If the answer cannot be determined, return an empty string."
};

const structured_gemini_llm = gemini_llm.withStructuredOutput(gemini_answer_schema);
const structured_groq_llm = groq_llm.withStructuredOutput(groq_answer_schema);

export const get_correct_answer = async (question, level) => {
    try {
        const ai_response = await structured_gemini_llm.invoke([
            new HumanMessage(get_correct_answer_prompt(question, level))
        ]);
        return ai_response
    }
    catch (error) {
        console.error("Gemini Error in correct_answer: ", error);
        try {
            const ai_response = await structured_groq_llm.invoke([
                new HumanMessage(get_correct_answer_prompt(question, level))
            ]);
            return ai_response
        }
        catch (error) {
            console.error("Groq Error in correct_answer: ", error);
            return "I do not know the correct answer for given question. based on your knowledge please evaluate."
        }
    }
}

