import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatGroq } from "@langchain/groq";
import dotenv from "dotenv";
import { SystemMessage, HumanMessage, AIMessage, ToolMessage } from "@langchain/core/messages";
import { conversation_prompt, get_instruction } from "../prompts/collect_information_prompts.js";
import { DynamicStructuredTool, Tool } from "@langchain/core/tools";
import { z } from "zod";
import path from "path";
import { type } from "os";

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

const saveNameTool = new DynamicStructuredTool({
    name: "save_name",
    description: "When user provides first or last name in messages, then to save name use this tool",
    schema: z.object({
        first_name: z.string()
            .optional()
            .nullable()
            .describe("a non-empty string if user provides first name of self, otherwise null"),
        last_name: z.string()
            .optional()
            .nullable()
            .describe("a non-empty string if user provides last name of self, otherwise null")
    }),
    func: async ({ first_name, last_name }) => {
        // Your implementation logic here
        console.log("Saving name:", { first_name, last_name });
    }
});

// Save Phone Number Tool  
const savePhoneNumberTool = new DynamicStructuredTool({
    name: "save_phone_number",
    description: "When user provides phone number in message, then to save phone number use this tool",
    schema: z.object({
        international_dialing_code: z.number()
            .int()
            .optional()
            .nullable()
            .describe("international dialing code of any country if specified by user do not assume, if not provided return null"),
        phone_number: z.number()
            .int()
            .describe("phone number of the user without international dialing code, no spaces, no dash, only phone number digits without international dialing code")
    }),
    func: async ({ international_dialing_code, phone_number }) => {
        // Your implementation logic here
        console.log("Saving phone:", { international_dialing_code, phone_number });
        return "Phone number saved successfully";
    }
});

const saveEmailTool = new DynamicStructuredTool({
    name: "save_email",
    description: "When user provides email address in message, then to save email address use this tool",
    schema: z.object({
        email: z.string()
            .email()
            .describe("email address of the user, must be a valid email format")
    }),
    func: async ({ email }) => {
        // Your implementation logic here
        console.log("Saving email:", { email });
        return "Email address saved successfully";
    }
});

const gemini_llm_with_tools = gemini_llm.bindTools([saveNameTool, savePhoneNumberTool, saveEmailTool]);
const groq_llm_with_tools = groq_llm.bindTools([saveNameTool, savePhoneNumberTool, saveEmailTool]);

export function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

const tool_call_handler = (ai_response, is_name, is_phone_number, is_email) => {
    let first_name = null;
    let last_name = null;
    let idc = null;
    let phone_number = null;
    let email = null;
    const tool_messages = [];
    if (ai_response.tool_calls && ai_response.tool_calls.length) {
        ai_response.tool_calls.forEach(tool_call => {
            const name = tool_call.name;
            const id = tool_call.id;
            const args = tool_call.args;

            if (name === 'save_name') {
                if (!is_name) {
                    let name_flag = false;
                    if (typeof args.first_name === 'string' && args.first_name.trim() !== '' && args.first_name !== 'null') {
                        first_name = args.first_name;
                        name_flag = true;
                    }
                    if (typeof args.last_name === 'string' && args.last_name.trim() !== '' && args.last_name !== 'null') {
                        last_name = args.last_name;
                        name_flag = true;
                    }
                    if (name_flag) {
                        is_name = true;
                        tool_messages.push(new ToolMessage({
                            content: `Name saved successfully, now next instruction is ${get_instruction(
                                is_name, is_phone_number, is_email
                            )}`,
                            tool_call_id: id
                        }))
                    }
                    else {
                        tool_messages.push(new ToolMessage({
                            content: `Provided name is not a valid name, First Name: ${args.first_name}\nLastName: ${args.last_name}`,
                            tool_call_id: id
                        }))
                    }
                }
                else {
                    tool_messages.push(new ToolMessage({
                        content: `Name is already collected, and can not be updated.`
                    }))
                }
            }
            else if (name === 'save_phone_number') {
                if (!is_phone_number) {
                    const args_idc = args.international_dialing_code;
                    const args_phone_number = args.phone_number;
                    if (typeof args_idc === 'number' && Number.isInteger(args_idc)) {
                        idc = args_idc;
                    }
                    if (typeof args_phone_number === 'number' && Number.isInteger(args_phone_number)) {
                        phone_number = args_phone_number;
                        is_phone_number = true;
                    }
                    if (is_phone_number) {
                        tool_messages.push(new ToolMessage({
                            content: `Phone number saved successfully, now next instruction is ${get_instruction(
                                is_name, is_phone_number, is_email
                            )}`,
                            tool_call_id: id
                        }))
                    }
                    else {
                        tool_messages.push(new ToolMessage({
                            content: `Provided phone number is not a valid phone number.\nInternational Dialing Code: +${args_idc}\nPhone Number: ${args_phone_number}`,
                            tool_call_id: id
                        }))
                    }
                }
                else {
                    tool_messages.push(new ToolMessage({
                        content: `Phone Number is already collected, and can not be updated.`,
                        tool_call_id: id
                    }))
                }
            }
            else if (name === 'save_email') {
                if (!is_email) {
                    if (typeof args.email === 'string' && isValidEmail(args.email)) {
                        is_email = true;
                        email = args.email;
                        tool_messages.push(new ToolMessage({
                            content: `Email address saved successfully, now next instruction is ${get_instruction(
                                is_name, is_phone_number, is_email
                            )}`,
                            tool_call_id: id
                        }))
                    }
                    else {
                        tool_messages.push(new ToolMessage({
                            content: `Invalid Email address, Email address is not saved.`,
                            tool_call_id: id
                        }))
                    }
                }
                else {
                    tool_messages.push(new ToolMessage({
                        content: `Email Address is already collected, and can not be updated.`,
                        tool_call_id: id
                    }))
                }
            }
            else {
                tool_messages.push(new ToolMessage({
                    content: `There is no tool available with name ${name}`,
                    tool_call_id: id
                }))
            }
        })
    }

    return {
        tool_messages: tool_messages,
        information: {
            first_name: first_name,
            last_name: last_name,
            international_dialing_code: idc,
            phone_number: phone_number,
            email: email
        },
        information_found_status: { is_name, is_phone_number, is_email }
    }
}

export const information_collector = async (messages, is_name, is_phone_number, is_email) => {
    try {
        const ai_response = await gemini_llm_with_tools.invoke([new SystemMessage(conversation_prompt(
            is_name, is_phone_number, is_email
        ))].concat(messages));
        messages.push(ai_response)
        const tool_response = tool_call_handler(ai_response, is_name, is_phone_number, is_email)
        messages = messages.concat(tool_response.tool_messages);
        is_name = tool_response.information_found_status.is_name;
        is_phone_number = tool_response.information_found_status.is_phone_number;
        is_email = tool_response.information_found_status.is_email;
        if (tool_response.tool_messages.length) {
            const ai_response2 = await gemini_llm_with_tools.invoke([new SystemMessage(conversation_prompt(
                is_name, is_phone_number, is_email
            ))].concat(messages));
            messages.push(ai_response2);
        }
        return {
            messages: messages,
            information: tool_response.information,
            information_found_status: tool_response.information_found_status
        }
    } catch (error) {
        console.error('Gemini Error while collecting information, Error: ', error);
        try {
            const ai_response = await groq_llm_with_tools.invoke([new SystemMessage(conversation_prompt(
                is_name, is_phone_number, is_email
            ))].concat(messages));
            messages.push(ai_response)
            const tool_response = tool_call_handler(ai_response, is_name, is_phone_number, is_email);
            is_name = tool_response.information_found_status.is_name;
            is_phone_number = tool_response.information_found_status.is_phone_number;
            is_email = tool_response.information_found_status.is_email;
            messages = messages.concat(tool_response.tool_messages);
            if (tool_response.tool_messages.length) {
                const ai_response2 = await groq_llm_with_tools.invoke([new SystemMessage(conversation_prompt(
                    is_name, is_phone_number, is_email
                ))].concat(messages));
                messages.push(ai_response2);
            }
            return {
                messages: messages,
                information: tool_response.information,
                information_found_status: tool_response.information_found_status
            }
        } catch (error) {
            messages.push(new AIMessage('Something went wrong, please try again later.'))
            return {
                messages: messages,
                information: {
                    first_name: null,
                    last_name: null,
                    international_dialing_code: null,
                    phone_number: null,
                    email: null
                },
                information_found_status: { is_name, is_phone_number, is_email }
            }
        }
    }
}

