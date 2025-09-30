import extract_information_from_resume from '../services/resume_parser.js';
import { set_user_information, varify_session } from '../services/sessions_manager.js';
import path from 'path';
import fs from 'fs';

export const api_parse_resume = async (req, res) => {
    const session_id = req.headers['session_id'];
    if (!req.file) {
        return res.status(400).json({ status: false, message: 'No file uploaded!' });
    }

    // Access the uploaded file name
    const uploadedFileName = req.file.filename;

    if (!uploadedFileName.toLowerCase().endsWith('.pdf') && !uploadedFileName.toLowerCase().endsWith('.docx')) {
        fs.unlinkSync(path.join('media', uploadedFileName));
        return res.status(400).json({ status: false, message: 'Either PDF or DOCX files are allowed.' })
    }

    const response = await extract_information_from_resume(uploadedFileName);

    if (response.status) {
        const set_info_response = set_user_information(session_id, response.information)
        res.json({
            success: set_info_response.status,
            session_id: set_info_response.session_id,
            information: set_info_response.information
        });
    }
    else {
        res.json({
            status: response.status,
            session_id: varify_session(),
            information: null
        })
    }
}
