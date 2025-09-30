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
            question1: null,
            correct_answer1: null,
            user_answer1: null,
            score1: null,
            question2: null,
            correct_answer2: null,
            user_answer2: null,
            score2: null
        },
        intermediate: {
            question1: null,
            correct_answer1: null,
            user_answer1: null,
            score1: null,
            question2: null,
            correct_answer2: null,
            user_answer2: null,
            score2: null,
        },
        advanced: {
            question1: null,
            correct_answer1: null,
            user_answer1: null,
            score1: null,
            question2: null,
            correct_answer2: null,
            user_answer2: null,
            score2: null,
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

export function varify_session(session_id){
    if(!users_information.has(session_id)){
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
    if (!questions.has(session_id)) {
        const new_session_id = create_session();
        session_id = new_session_id;
    }

    return {
        session_id: session_id,
        questions: questions.get(session_id)
    }
}

export function set_questions_in_specific_level(questions_data, question, correct_answer, user_answer, level, score) {
    if (typeof level !== 'string') {
        console.log('type of level is not string in set specific function.')
        return false
    }
    if (typeof level === 'string' && !['begginer', 'intermediate', 'advanced'].includes(level)) {
        console.log('level is not any of ["begginer", "intermediate", "advanced"]')
        return false
    }
    if (
        questions_data[level].question1 === null ||
        (
            typeof questions_data[level].question1 === 'string' &&
            questions_data[level].question1.trim() === ''
        )
    ) {
        questions.set(session_id, {
            ...questions_data,
            [level]: {
                ...questions_data[level],
                question1: question,
                correct_answer1: correct_answer,
                user_answer1: user_answer,
                score1: score
            }
        })
        console.log(`for level ${level}, Question and answer stored in Question1`);
        return true
    }
    else if (
        questions_data[level].question2 === null ||
        (
            typeof questions_data[level].question2 === 'string' &&
            questions_data[level].question2.trim() === ''
        )
    ) {
        questions.set(session_id, {
            ...questions_data,
            [level]: {
                ...questions_data[level],
                question2: question,
                correct_answer2: correct_answer,
                user_answer2: user_answer,
                score2: score
            }
        })
        console.log(`for level ${level}, Question and answer stored in Question2`)
        return true
    }
    else { // both questions for begginers are already taken so can not store new one.
        console.log(`In level ${level}, both questions with their answer are already stored.`)
        return false
    }
}

export function set_questions_information(session_id, question, correct_answer, user_answer, level, score) {
    if ( // varify all fields are provided with correct data type
        typeof question === 'string' && question.trim() !== '' &&
        typeof correct_answer === 'string' && correct_answer.trim() !== '' &&
        typeof user_answer === 'string' && user_answer.trim() !== '' &&
        typeof level === 'number' && [0, 1, 2].includes(level)
    ) {
        score = typeof score === 'number' ? score : null
        if (!questions.has(session_id)) { // if invalid session id then create new one
            const new_session_id = create_session();
            session_id = new_session_id;
        }
        const questions_data = questions.get(session_id);
        if (level === 0) { // begginer level
            return {
                session_id: session_id,
                status: set_questions_in_specific_level(
                    questions_data,
                    question,
                    correct_answer,
                    user_answer,
                    'begginer',
                    score
                )
            }
        }
        else if (level === 1) { // intermediate level 
            return {
                session_id: session_id,
                status: set_questions_in_specific_level(
                    questions_data,
                    question,
                    correct_answer,
                    user_answer,
                    'intermediate',
                    score
                )
            }
        }
        else if (level === 2) {
            return {
                session_id: session_id,
                status: set_questions_in_specific_level(
                    questions_data,
                    question,
                    correct_answer,
                    user_answer,
                    'advanced',
                    score
                )
            }
        }
        else {
            console.log(`In set questions information function level is not any of [0, 1, 2]\nLevel${level}`)
            return {
                session_id: session_id,
                status: false
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
            status: false
        }
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

export function set_information_collection_messages(session_id, message) {
    if (!conversations.has(session_id)) {
        const new_session_id = create_session();
        session_id = new_session_id;
    }
    const messages = conversations.get(session_id);
    conversations.set(session_id, {
        ...messages,
        information_collection: [...messages.information_collection, message]
    })
    return {
        session_id: session_id,
        status: true
    }
}

export function set_interview_messages(session_id, message) {
    if (!conversations.has(session_id)) {
        const new_session_id = create_session();
        session_id = new_session_id;
    }
    const messages = conversations.get(session_id);
    conversations.set(session_id, {
        ...messages,
        interview: [...messages.interview, message]
    })
    return {
        session_id: session_id,
        status: true
    }
}
