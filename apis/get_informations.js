import { messageToGroqRole } from "@langchain/groq";
import {
    get_user_information,
    get_questions_information,
    get_inforamtion_collection_messages,
    get_interview_messages
} from "../services/sessions_manager.js";

export function api_get_user_information(req, res) {
    const session_id = req.headers['session_id']; 
    const data = get_user_information(session_id);
    res.status(200).json({
        session_id: data.session_id,
        information: data.information
    })
}

export function api_get_questions_information(req, res) {
    const session_id = req.headers['session_id']; 
    const data = get_questions_information(session_id);
    res.status(200).json({
        session_id: data.session_id,
        questions: data.questions
    })
}

export function api_get_information_collection_messages(req, res) {
    const session_id = req.headers['session_id']; 
    const data = get_inforamtion_collection_messages(session_id);
    // langchain message format to json messages
    res.status(200).json({
        session_id: session_id,
        messages: data.messages
    })
}

export function api_get_interview_messages(req ,res) {
    const session_id = req.headers['session_id']; 
    const data = get_interview_messages(session_id);
    // langchain message format to json messages
    res.status(200).json({
        session_id: session_id,
        messages: data.messages
    })
}
