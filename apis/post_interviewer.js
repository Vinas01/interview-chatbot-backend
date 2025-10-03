import { interviewer_agent } from "../services/interviewer.js";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import {
    get_interview_messages,
    set_interview_messages,
    get_questions_information,
    set_questions_information,
    set_questions_score_and_reason
} from "../services/sessions_manager.js";
import { get_empty_assessment_information } from "../prompts/interviewer_prompts.js";
import { get_correct_answer } from "../services/correct_answer.js";
import { evaluator_agent } from "../services/evaluator.js";
import { stat } from "fs";
import { diff } from "util";
import { type } from "os";

const evaluate_answer = async (session_id, level, assessment_number) => {
    const questions_response = get_questions_information(session_id);
    session_id = questions_response.session_id;
    const questions = questions_response.questions;
    if (assessment_number === null || typeof assessment_number !== 'number') {
        return
    }
    const difficulty_level = level === 0 ? 'begginer' : level === 1 ? 'intermediate' : 'advanced';
    const question = (
        (assessment_number === 1) ?
            questions[difficulty_level].assessment1.question :
            questions[difficulty_level].assessment2.question
    );
    if(typeof question !== 'string'){
        return
    }
    if(typeof question === ''){
        return
    }
    const correct_answer = (
        (assessment_number === 1) ?
            questions[difficulty_level].assessment1.correct_answer :
            questions[difficulty_level].assessment2.correct_answer
    );
    const user_answer = (
        (assessment_number === 1) ?
        questions[difficulty_level].assessment1.user_answer :
        questions[difficulty_level].assessment2.user_answer
    )
    const { score, reason } = await evaluator_agent(question, correct_answer, user_answer, level);
    if(score === null || reason === null){
        return
    }
    set_questions_score_and_reason(session_id, level, assessment_number, score, reason);
}

export const api_interviewer_chatbot = async (req, res) => {
    let session_id = req.headers['session_id'];
    console.log("\n\n\nSession id from header: ", session_id);
    const user_message = req.body.message;
    const finish_reason = req.body.finish_reason;

    let level = null;
    const messages_data = get_interview_messages(session_id);
    session_id = messages_data.session_id;
    console.log("Session Id from get interview messages: ", session_id);
    let messages = messages_data.messages;

    if (messages.length > 0) {
        const last_message = messages.at(-1);
        if (last_message instanceof AIMessage) {
            const empty_assessment_response = get_empty_assessment_information(session_id);
            session_id = empty_assessment_response.session_id;
            console.log("Session Id from empty assessment information: ", session_id);
            level = empty_assessment_response.level

            const correct_answer = await get_correct_answer(last_message.content, level);
            const set_questions_response = set_questions_information(
                session_id,
                last_message.content,
                correct_answer,
                user_message,
                level,
                finish_reason
            )
            if (!set_questions_response.status) {
                return res.status(401).json({
                    status: false,
                    session_id: session_id,
                    completed: false,
                    message: null
                })
            }
            session_id = set_questions_response.session_id;
            console.log("Session id from set questions information: ", session_id);
            level = set_questions_response.level;
            evaluate_answer(session_id, level, set_questions_response.assessment_number)
        }
        else {
            return res.status(401).json({
                status: false,
                session_id: session_id,
                completed: false,
                message: null
            })
        }
    }

    messages.push(new HumanMessage(user_message));

    const empty_assessment_response = get_empty_assessment_information(session_id);
    session_id = empty_assessment_response.session_id;
    level = empty_assessment_response.level;
    if (level === null) {
        return res.status(200).json({
            status: true,
            session_id: session_id,
            completed: true,
            message: null
        })
    }


    const response = await interviewer_agent(session_id, messages);
    session_id = response.session_id;
    console.log("Session id from interview agent: ", session_id);
    messages = response.messages;
    const set_interview_messages_response = set_interview_messages(session_id, messages);
    session_id = set_interview_messages_response.session_id;
    console.log("Session Id from set interview messages: ", session_id);
    if (set_interview_messages_response.status) {
        if (messages.at(-1) instanceof AIMessage) {
            return res.status(200).json({
                status: true,
                session_id: session_id,
                completed: false,
                message: {
                    role: 'ai',
                    content: messages.at(-1).content
                }
            })
        }
        else {
            return res.status(401).json({
                status: false,
                session_id: session_id,
                completed: false,
                message: null
            })
        }
    }
    else {
        return res.status(401).json({
            status: false,
            session_id: session_id,
            completed: false,
            message: null
        })
    }
}