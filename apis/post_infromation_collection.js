import { information_collector } from '../services/collect_information.js';
import {
    varify_session,
    get_user_information,
    set_user_information,
    get_inforamtion_collection_messages,
    set_information_collection_messages
} from '../services/sessions_manager.js';
import { isValidEmail } from '../services/collect_information.js';
import { HumanMessage, AIMessage } from "@langchain/core/messages";

export const api_information_collector_chatbot = async (req, res) => {
    const user_message = req.body.message;
    let session_id = req.headers['session_id'];

    const user_data = get_user_information(session_id);
    const user_information = user_data.information;
    session_id = user_data.session_id;
    let is_name = false;
    let is_phone_number = false;
    let is_email = false;

    if (typeof user_message === 'string' && user_message.trim().length === 0) {
        return res.status(400).json({
            status: false,
            message: {
                role: 'ai',
                content: 'Empty message is not allowed.'
            },
            tool_calls: false,
            information: user_information,
            session_id: session_id
        });
    }

    if ((
        typeof user_information.first_name === 'string' &&
        user_information.first_name.trim().length > 0
    ) || (
            typeof user_information.last_name === 'string' &&
            user_information.last_name.trim().length > 0
        )) {
        is_name = true;
    }
    else {
        is_name = false;
    }

    if (
        typeof user_information.phone_number === 'number' &&
        user_information.phone_number > 0 &&
        user_information.phone_number.toString().trim().length > 5
    ) {
        is_phone_number = true;
    }
    else {
        is_phone_number = false;
    }

    if (
        typeof user_information.email === 'string' &&
        isValidEmail(user_information.email)
    ) {
        is_email = true;
    }
    else {
        is_email = false;
    }

    const messages_data = get_inforamtion_collection_messages(session_id);
    session_id = messages_data.session_id;
    const messages = messages_data.messages;
    messages.push(new HumanMessage(user_message))

    const response = await information_collector(
        messages,
        is_name,
        is_phone_number,
        is_email
    );

    if (response.messages.length == 0) {
        return res.status(500).json({
            status: false,
            message: {
                role: 'ai',
                content: 'Something went wrong, problem is not from your side. Please try again later.'
            },
            tool_calls: false,
            information: user_information,
            session_id: session_id
        });
    }

    const last_message = response.messages.at(-1);

    if (!(last_message instanceof AIMessage)) {
        return res.status(500).json({
            status: false,
            message: {
                role: 'ai',
                content: 'Something went wrong, problem is not from your side. Please try again later.'
            },
            tool_calls: false,
            information: user_information,
            session_id: session_id
        });
    }

    const save_messages_response = set_information_collection_messages(session_id, response.messages);
    session_id = save_messages_response.session_id;
    // quesiton, what if it fails to store the messages?

    if (
        last_message.tool_calls &&
        Array.isArray(last_message.tool_calls) &&
        last_message.tool_calls.length > 0
    ) {
        return res.status(200).json({
            status: true,
            message: {
                role: 'ai',
                content: ''
            },
            tool_calls: true,
            information: user_information,
            session_id: session_id,
        })
    }

    const save_user_information_response = set_user_information(session_id, response.information);
    session_id = save_user_information_response.session_id;

    const updated_user_data = get_user_information(session_id);
    const updated_user_information = updated_user_data.information;
    session_id = updated_user_data.session_id;

    return res.status(200).json({
        status: true,
        message: {
            role: 'ai',
            content: last_message.content
        },
        tool_calls: false,
        information: updated_user_information,
        session_id: session_id
    });

}