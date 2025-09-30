import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatGroq } from "@langchain/groq";
import dotenv from "dotenv";
import fs, { read } from 'fs';
import { z } from "zod";
import path from "path";
import information_extractor_prompts from "../prompts/information_extractor_prompts.js";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";

dotenv.config({ path: path.join(process.cwd(), '.env') });

const llm = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-pro",
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

const information = z.object({
  first_name: z.string().nullable().describe(
    "The given name (first name) of the person whose resume is being parsed. " +
    "If the first name cannot be identified, return null. " + 
    "Do not infer or generate a placeholder."
  ),
  
  last_name: z.string().nullable().describe(
    "The family name (last name) of the person whose resume is being parsed. " + 
    "If the last name cannot be identified, return null. " + 
    "Do not infer or generate a placeholder."
  ),
  
  international_dialing_code: z.number().describe(
    "The international dialing code that precedes the phone number (e.g., +91 for India, +1 for USA, +972 for Israel). " +
    "Return only the numeric code without the '+' sign. " + 
    "If no international dialing code is found, strictly return 0."
  ),
  
  phone_number: z.number().describe(
    "The contact phone number of the person without the country code. " +
    "For example, if the resume contains '+91 9876543210', return 9876543210. " +
    "Do not include spaces, hyphens, or international dialing code. " +
    "If no phone number is found, strictly return 0."
  ),
  
  email: z.string().nullable().describe(
    "The email address of the person mentioned in the resume. " + 
    "The value must be a valid email format. " +
    "If an email cannot be identified, strictly return null."
  )
})

const information_schema = {
  type: "object",
  properties: {
    first_name: {
      type: "string",
      nullable: true,
      description:
        "The given name (first name) of the person whose resume is being parsed. " +
        "If the first name cannot be identified, return null. " +
        "Do not infer or generate a placeholder."
    },
    last_name: {
      type: "string",
      nullable: true,
      description:
        "The family name (last name) of the person whose resume is being parsed. " +
        "If the last name cannot be identified, return null. " +
        "Do not infer or generate a placeholder."
    },
    international_dialing_code: {
      type: "integer",
      description:
        "The international dialing code that precedes the phone number (e.g., +91 for India, +1 for USA, +972 for Israel). " +
        "Return only the numeric code without the '+' sign. " +
        "If no international dialing code is found, strictly return 0."
    },
    phone_number: {
      type: "integer",
      description:
        "The contact phone number of the person without the international dialing code. " +
        "For example, if the resume contains '+91 9876543210', return 9876543210. " +
        "Do not include spaces, hyphens, or country code. " +
        "If no phone number is found, strictly return 0."
    },
    email: {
      type: "string",
      nullable: true,
      description:
        "The email address of the person mentioned in the resume. " +
        "The value must be a valid email format. " +
        "If an email cannot be identified, strictly return null."
    }
  },
  required: [
    "first_name",
    "last_name",
    "international_dialing_code",
    "phone_number",
    "email"
  ]
};

const structured_llm = llm.withStructuredOutput(information_schema);
const structured_groq_llm = groq_llm.withStructuredOutput(information);

const read_resume_file = async (filename) => {
    const filepath = path.join('media', filename);
    if(fs.existsSync(filepath)){
        if(filename.endsWith('.pdf')){
            let file_content = ''
            const pdfLoader = new PDFLoader(filepath);
            const pdfDocs = await pdfLoader.load();
            pdfDocs.forEach((doc, index) => {
                file_content += `\n\n\nPage ${index+1}\n${doc.pageContent}`
            })
            return { status: true, content: file_content }
        } 
        else if(filename.endsWith('.docx')) {
            let file_content = ''
            const docxLoader = new DocxLoader(filepath);
            const docxDocs = await docxLoader.load();
            docxDocs.forEach((doc, index) => {
                file_content += `\n\n\nPage ${index+1}\n${doc.pageContent}`
            })
            return { status: true, content: file_content }
        }
        else{
            return { status: false, message: 'Given File is neither pdf file not docx file.' }
        }
    }
    else{
        return { status: false, message: 'File does not exists' }
    }
}

const extract_information_from_resume = async (filename) => {
  const file_read_response = await read_resume_file(filename);
  if (file_read_response.status){
    const resume_content = file_read_response.content;
    try{
      const ai_structured_response = await structured_llm.invoke([
        new SystemMessage(information_extractor_prompts),
        new HumanMessage('Resume Content:'+resume_content)
      ]) 
      console.log('GEMINI 2.5 PRO has extracted: ', ai_structured_response)
      return {
        status: true,
        information: ai_structured_response
      }
    } catch(error) {
      console.error('information_extractor | gemini | Error: ', error)
      console.log('\n\nTrying with Groq...')

      try{
        const ai_structured_response = await structured_llm.invoke([
          new SystemMessage(information_extractor_prompts),
          new HumanMessage('Resume Content:'+resume_content)
        ]) 
        console.log('GPT OSS 120b has extracted: ', ai_structured_response)
        return {
          status: true,
          information: ai_structured_response
        }
      } catch(error) {
        console.error('information_extractor | groq | Error: ', error);
        return {
          status: false,
          information: {
            first_name: null,
            last_name: null,
            international_dialing_code: null,
            phone_number: null,
            email: null
          }
        }
      }
    }
  }
  else{
    console.log('Failed to read ', filename, ' file.')
    return {
      status: false,
      information: {
        first_name: null,
        last_name: null,
        international_dialing_code: null,
        phone_number: null,
        email: null
      }
    }
  }
}

export default extract_information_from_resume;

