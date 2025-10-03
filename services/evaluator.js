import { ChatGroq } from "@langchain/groq";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { evaluator_prompt } from "../prompts/evaluator_prompts.js";
import dotenv from "dotenv";
import path from "path";
import { z } from "zod";

dotenv.config({ path: path.join(process.cwd(), '.env') });

const groq_llm = new ChatGroq({
    model: "openai/gpt-oss-120b",
    temperature: 0,
    maxRetries: 2,
    apiKey: process.env.GROQ_API_KEY
});

const scoring_schema = (max_score) => {
    return z.object({
        score: z
            .number()
            .min(0, "Score must be at least 0")
            .max(max_score, `Score must be at most ${max_score}`)
            .refine(
                (val) => {
                    // Check if the number has at most 2 decimal places
                    return Number((val * 100).toFixed(0)) === val * 100;
                },
                {
                    message: "Score must have at most 2 decimal precision",
                }
            )
            .describe(
                `Floating point score between 0-${max_score} with exactly 2 decimal precision indicating how correct the user's answer is`
            ),

        reason: z
            .string()
            .min(30, "Reason must be detailed")
            .describe(
                `Small to medium length explanation that describes the score and provides reasoning. Must include: 1) Brief description of what the score indicates about correctness, 2) Detailed explanation of why this specific score was assigned, 3) If score is deducted from full marks (${max_score}), clearly explain what was incorrect, incomplete, or missing in the user's answer`
            ),
    });
}

export const evaluator_agent = async (question, correct_answer, user_answer, level) => {
    const max_score = level === 0 ? 10 : level === 1 ? 15 : 25;
    const structured_output_llm = groq_llm.withStructuredOutput(scoring_schema(max_score));
    try {
        return await structured_output_llm.invoke([
            new SystemMessage(evaluator_prompt(question, correct_answer, level)),
            new HumanMessage("User's Answer:\n" + user_answer)
        ]);
    }
    catch(error){
        console.error("Error in evaluator: ", error);
        return {
            score: null,
            reason: null
        }
    }
}
