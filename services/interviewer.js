import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatGroq } from "@langchain/groq";
import { DynamicStructuredTool, tool, Tool } from "@langchain/core/tools";
import { SystemMessage, HumanMessage, AIMessage, ToolMessage } from "@langchain/core/messages";
import { interviewer_prompt } from "../prompts/interviewer_prompts.js";
import {
    get_interview_messages,
    set_interview_messages,
    set_questions_information

} from "./sessions_manager.js";
import dotenv from "dotenv";
import path from "path";
import { z } from "zod";

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


export const interviewer_agent = async (session_id, messages) => {
    const empty_assessment_response = interviewer_prompt (session_id);
    session_id = empty_assessment_response.session_id;
    console.log("Inside Interview agent Session id from interview prompt: ", session_id)
    const system_prompt = empty_assessment_response.system_prompt;
    try {
        const ai_response = await gemini_llm.invoke([
            new SystemMessage(system_prompt),
            ...messages
        ]);
        messages.push(ai_response);
        return {
            session_id: session_id,
            messages: messages
        }
    }
    catch (error) {
        console.log("Gemini Error in interviewer_agent: ", error);
        // Fallback to Groq LLM
        try {
            const ai_response = await groq_llm.invoke([
                new SystemMessage(system_prompt),
                ...messages
            ]);
            messages.push(ai_response);
            return {
                session_id: session_id,
                messages: messages
            }
        }
        catch (error) {
            console.log("Groq Error in interviewer_agent: ", error);
            return {
                session_id: session_id,
                messages: messages
            }
        }
    }
}
