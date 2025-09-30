import express from 'express';
import dotenv from 'dotenv'
import multer from 'multer';
import path from 'path';

import {
    api_get_user_information,
    api_get_questions_information,
    api_get_information_collection_messages,
    api_get_interview_messages
} from './apis/get_informations.js';
import { storage, fileFilter } from './services/multer_storage_and_filter.js';
import { api_parse_resume } from './apis/post_parse_resume.js';

dotenv.config();

const app = express();
app.use(express.json());

const upload = multer({ storage });

app.get('/get-user-information', api_get_user_information);
app.get('/get-questions-information', api_get_questions_information);
app.get('/get-info-collect-messages', api_get_information_collection_messages);
app.get('/get-interview-messages', api_get_interview_messages);

app.post('/parse-resume', upload.single('file'), api_parse_resume)

const PORT = process.env.PORT || 7500;
app.listen(PORT, () => {
    console.log(`🚀 Server is running at PORT ${PORT}`);
});