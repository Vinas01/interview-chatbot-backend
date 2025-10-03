import { v4 as uuidv4 } from "uuid";
import { isValidEmail } from "./collect_information.js";

const users_information = new Map()
const questions = new Map()
const conversations = new Map()

function create_session() {
    const session_id = uuidv4();
    const users_data = {
        first_name: null,
        last_name: null,
        international_dialing_code: null,
        phone_number: null,
        email: null,
    }
    const questions_data = {
        begginer: {
            assessment1: {
                question: null,
                correct_answer: null,
                user_answer: null,
                score: null,
                evaluation_reason: null,
                finish_reason: null
            },
            assessment2: {
                question: null,
                correct_answer: null,
                user_answer: null,
                score: null,
                evaluation_reason: null,
                finish_reason: null
            },
        },
        intermediate: {
            assessment1: {
                question: null,
                correct_answer: null,
                user_answer: null,
                score: null,
                evaluation_reason: null,
                finish_reason: null
            },
            assessment2: {
                question: null,
                correct_answer: null,
                user_answer: null,
                score: null,
                evaluation_reason: null,
                finish_reason: null
            },
        },
        advanced: {
            assessment1: {
                question: null,
                correct_answer: null,
                user_answer: null,
                score: null,
                evaluation_reason: null,
                finish_reason: null
            },
            assessment2: {
                question: null,
                correct_answer: null,
                user_answer: null,
                score: null,
                evaluation_reason: null,
                finish_reason: null
            },
        }
    }
    const conversations_data = {
        information_collection: [],
        interview: []
    }
    users_information.set(session_id, users_data);
    questions.set(session_id, questions_data);
    conversations.set(session_id, conversations_data);
    return session_id
}

export function get_user_information(session_id) {
    if (!users_information.has(session_id)) {
        console.log('session id not found while getting user information.')
        const new_session_id = create_session();
        session_id = new_session_id;
    }
    return {
        session_id: session_id,
        information: users_information.get(session_id)
    }
}

export function varify_session(session_id) {
    if (!users_information.has(session_id)) {
        return create_session();
    }
    return session_id;
}

export function set_user_information(session_id, information) {
    let fname = null;
    let lname = null;
    let idc = null;
    let phone_number = null;
    let email = null;
    if (!users_information.has(session_id)) {
        console.log('Session Id not found while update informaiton in users_information.');
        const new_session_id = create_session();
        session_id = new_session_id;
    }

    const existing_data = users_information.get(session_id);
    if (
        'first_name' in information &&
        typeof information.first_name === 'string' &&
        information.first_name.trim() !== '' &&
        information.first_name !== 'null'
    ) {
        fname = information.first_name;
    }
    else {
        fname = existing_data.first_name;
    }
    if (
        'last_name' in information &&
        typeof information.last_name === 'string' &&
        information.last_name.trim() !== '' &&
        information.last_name !== 'null'
    ) {
        lname = information.last_name;
    }
    else {
        lname = existing_data.last_name;
    }
    if (
        'international_dialing_code' in information &&
        typeof information.international_dialing_code === 'number' &&
        Number.isInteger(information.international_dialing_code) &&
        information.international_dialing_code > 0
    ) {
        idc = information.international_dialing_code;
    }
    else {
        idc = existing_data.international_dialing_code;
    }
    if (
        'phone_number' in information &&
        typeof information.phone_number === 'number' &&
        Number.isInteger(information.phone_number) &&
        information.phone_number > 0 &&
        String(information.phone_number).length > 5
    ) {
        phone_number = information.phone_number;
    }
    else {
        phone_number = existing_data.phone_number;
    }
    if (
        'email' in information &&
        typeof information.email === 'string' &&
        isValidEmail(information.email)
    ) {
        email = information.email;
    }
    else {
        email = existing_data.email;
    }
    const data = {
        first_name: fname,
        last_name: lname,
        international_dialing_code: idc,
        phone_number: phone_number,
        email: email
    }
    users_information.set(session_id, data);
    return {
        session_id: session_id,
        information: data
    }
}

export function get_questions_information(session_id) {
    console.log("Fresh session_id in get_questions_information: ", session_id);
    if (!questions.has(session_id)) {
        console.log("!questions.has(session_id)", !questions.has(session_id))
        const new_session_id = create_session();
        session_id = new_session_id;
    }

    console.log("Session id in get_questions_information just before return: ", session_id);

    return {
        session_id: session_id,
        questions: questions.get(session_id)
    }
}

export function set_questions_in_specific_level(
    session_id,
    questions_data,
    question,
    correct_answer,
    user_answer,
    level,
    finish_reason
) {
    if (typeof level !== 'string') {
        console.log('type of level is not string in set specific function.')
        return {
            status: false,
            question_number: null
        }
    }
    if (typeof level === 'string' && !['begginer', 'intermediate', 'advanced'].includes(level)) {
        console.log('level is not any of ["begginer", "intermediate", "advanced"]')
        return {
            status: false,
            question_number: null
        }
    }
    if (
        questions_data[level].assessment1.question === null ||
        (
            typeof questions_data[level].assessment1.question === 'string' &&
            questions_data[level].assessment1.question.trim() === ''
        )
    ) {
        questions.set(session_id, {
            ...questions_data,
            [level]: {
                ...questions_data[level],
                assessment1: {
                    question: question,
                    correct_answer: correct_answer,
                    user_answer: user_answer,
                    score: null,
                    evaluation_reason: null,
                    finish_reason: finish_reason
                }
            }
        })
        console.log(`for level ${level}, Question and answer stored in Question1`);
        return {
            status: true,
            assessment_number: 1
        }
    }
    else if (
        questions_data[level].assessment2.question === null ||
        (
            typeof questions_data[level].assessment2.question === 'string' &&
            questions_data[level].assessment2.question.trim() === ''
        )
    ) {
        questions.set(session_id, {
            ...questions_data,
            [level]: {
                ...questions_data[level],
                assessment2: {
                    question: question,
                    correct_answer: correct_answer,
                    user_answer: user_answer,
                    score: null,
                    evaluation_reason: null,
                    finish_reason: finish_reason
                }
            }
        })
        console.log(`for level ${level}, Question and answer stored in Question2`)
        return {
            status: true,
            assessment_number: 2
        }
    }
    else { // both questions for begginers are already taken so can not store new one.
        console.log(`In level ${level}, both questions with their answer are already stored.`)
        return {
            status: false,
            assessment_number: null
        }
    }
}

export function set_questions_information(session_id, question, correct_answer, user_answer, level, finish_reason) {
    if ( // varify all fields are provided with correct data type
        typeof question === 'string' && question.trim() !== '' &&
        typeof correct_answer === 'string' && correct_answer.trim() !== '' &&
        typeof user_answer === 'string' && user_answer.trim() !== '' &&
        typeof level === 'number' && [0, 1, 2].includes(level)
    ) {
        if (!questions.has(session_id)) { // if invalid session id then create new one
            const new_session_id = create_session();
            session_id = new_session_id;
        }
        const questions_data = questions.get(session_id);
        if (level === 0) { // begginer level
            const response = set_questions_in_specific_level(
                session_id,
                questions_data,
                question,
                correct_answer,
                user_answer,
                'begginer',
                finish_reason
            )
            return {
                session_id: session_id,
                level: level,
                status: response.status,
                assessment_number: response.assessment_number
            }
        }
        else if (level === 1) { // intermediate level 
            const response = set_questions_in_specific_level(
                session_id,
                questions_data,
                question,
                correct_answer,
                user_answer,
                'intermediate',
                finish_reason
            )
            return {
                session_id: session_id,
                level: level,
                status: response.status,
                assessment_number: response.assessment_number
            }
        }
        else if (level === 2) {
            const response = set_questions_in_specific_level(
                session_id,
                questions_data,
                question,
                correct_answer,
                user_answer,
                'advanced',
                finish_reason
            )
            return {
                session_id: session_id,
                level: level,
                status: response.status,
                assessment_number: response.assessment_number
            }
        }
        else {
            console.log(`In set questions information function level is not any of [0, 1, 2]\nLevel${level}`)
            return {
                session_id: session_id,
                level: level,
                status: false,
                assessment_number: null
            }
        }
    }
    else {
        if (typeof question !== 'string') {
            console.log(`In set questions information | Question type received ${typeof question}, expected string`);
        }
        if (typeof question === 'string' && question.trim() === '') {
            console.log('In set questions information | Question is empty');
        }
        if (typeof correct_answer !== 'string') {
            console.log(`In set questions information | correct_answer type received ${typeof correct_answer}, expected string`);
        }
        if (typeof correct_answer === 'string' && correct_answer.trim() === '') {
            console.log('In set questions information | correct_answer is empty');
        }
        if (typeof user_answer !== 'string') {
            console.log(`In set questions information | user_answer type received ${typeof user_answer}, expected string`);
        }
        if (typeof user_answer === 'string' && user_answer.trim() === '') {
            console.log('In set questions information | user_answer is empty');
        }
        if (typeof level !== 'number') {
            console.log(`In set questions information | level type received ${typeof user_answer}, expected number`);
        }
        if (typeof level === 'number' && ![0, 1, 2].includes(level)) {
            console.log(`In set questions information | level must be any of [0,1,2], received ${level}`);
        }
        return {
            session_id, session_id,
            level: level,
            status: false,
            assessment_number: null
        }
    }
}

export function set_questions_score_and_reason(session_id, level, assessment_number, score, reason) {
    if (!questions.has(session_id)) {
        return false;
    }
    const questions_data = questions.get(session_id);
    if (typeof level === 'number' && [0, 1, 2].includes(level)) {
        if (level === 0) { // begginer level
            if (
                assessment_number === 1 &&
                typeof questions_data.begginer.assessment1.question === 'string' &&
                questions_data.begginer.assessment1.question.trim() !== ''
            ) {
                questions.set(session_id, {
                    ...questions_data,
                    begginer: {
                        ...questions_data.begginer,
                        assessment1: {
                            ...questions_data.begginer.assessment1,
                            score: score,
                            evaluation_reason: reason
                        }
                    }
                })
                return true;
            }
            else if (
                assessment_number === 2 &&
                typeof questions_data.begginer.assessment2.question === 'string' &&
                questions_data.begginer.assessment2.question.trim() !== ''
            ) {
                questions.set(session_id, {
                    ...questions_data,
                    begginer: {
                        ...questions_data.begginer,
                        assessment2: {
                            ...questions_data.begginer.assessment2,
                            score: score,
                            evaluation_reason: reason
                        }
                    }
                })
                return true;
            }
            else {
                return false;
            }
        }
        else if (level === 1) { // intermediate level
            if (
                assessment_number === 1 &&
                typeof questions_data.intermediate.assessment1.question === 'string' &&
                questions_data.intermediate.assessment1.question.trim() !== ''
            ) {
                questions.set(session_id, {
                    ...questions_data,
                    intermediate: {
                        ...questions_data.intermediate,
                        assessment1: {
                            ...questions_data.intermediate.assessment1,
                            score: score,
                            evaluation_reason: reason
                        }
                    }
                }
                )
                return true;
            }
            else if (
                assessment_number === 2 &&
                typeof questions_data.intermediate.assessment2.question === 'string' &&
                questions_data.intermediate.assessment2.question.trim() !== ''
            ) {
                questions.set(session_id, {
                    ...questions_data,
                    intermediate: {
                        ...questions_data.intermediate,
                        assessment2: {
                            ...questions_data.intermediate.assessment2,
                            score: score,
                            evaluation_reason: reason
                        }
                    }
                })
                return true;
            }
            else {
                return false;
            }
        }
        else if (level === 2) { // advanced level
            if (
                assessment_number === 1 &&
                typeof questions_data.advanced.assessment1.question === 'string' &&
                questions_data.advanced.assessment1.question.trim() !== ''
            ) {
                questions.set(session_id, {
                    ...questions_data,
                    advanced: {
                        ...questions_data.advanced,
                        assessment1: {
                            ...questions_data.advanced.assessment1,
                            score: score,
                            evaluation_reason: reason
                        }
                    }
                })
                return true;
            }
            else if (
                assessment_number === 2 &&
                typeof questions_data.advanced.assessment2.question === 'string' &&
                questions_data.advanced.assessment2.question.trim() !== ''
            ) {
                questions.set(session_id, {
                    ...questions_data,
                    advanced: {
                        ...questions_data.advanced,
                        assessment2: {
                            ...questions_data.advanced.assessment2,
                            score: score,
                            evaluation_reason: reason
                        }
                    }
                })
                return true;
            }
            else {
                return false;
            }
        }
        else {
            return false;
        }
    } else {
        return false;
    }
}

export function get_inforamtion_collection_messages(session_id) {
    if (!conversations.has(session_id)) {
        const new_session_id = create_session();
        session_id = new_session_id;
    }

    return {
        session_id: session_id,
        messages: conversations.get(session_id).information_collection
    }
}

export function get_interview_messages(session_id) {
    if (!conversations.has(session_id)) {
        const new_session_id = create_session();
        session_id = new_session_id
    }

    return {
        session_id: session_id,
        messages: conversations.get(session_id).interview
    }
}

export function set_information_collection_messages(session_id, messages) {
    if (!conversations.has(session_id)) {
        const new_session_id = create_session();
        session_id = new_session_id;
    }
    const all_messages = conversations.get(session_id);
    conversations.set(session_id, {
        ...all_messages,
        information_collection: messages
    })
    return {
        session_id: session_id,
        status: true
    }
}

export function set_interview_messages(session_id, messages) {
    if (!conversations.has(session_id)) {
        const new_session_id = create_session();
        session_id = new_session_id;
    }
    const all_messages = conversations.get(session_id);
    conversations.set(session_id, {
        ...all_messages,
        interview: messages
    })
    return {
        session_id: session_id,
        status: true
    }
}
