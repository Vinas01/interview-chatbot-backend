import { get_questions_information } from "../services/sessions_manager.js";

export const get_empty_assessment_information = (session_id) => {
    const questions_information = get_questions_information(session_id);
    session_id = questions_information.session_id;
    const questions = questions_information.questions;
    if (
        questions.begginer.assessment1.question === null ||
        (
            typeof questions.begginer.assessment1.question === 'string' &&
            questions.begginer.assessment1.question.trim() === ''
        )
    ) {
        return {
            instruction: "Ask a begginer level question.",
            session_id: session_id,
            level: 0,
            assessment_number: 1
        }
    }
    else if (questions.begginer.assessment2.question === null ||
        (
            typeof questions.begginer.assessment2.question === 'string' &&
            questions.begginer.assessment2.question.trim() === ''
        )
    ) {
        return {
            instruction: "Ask a begginer level question.",
            session_id: session_id,
            level: 0,
            assessment_number: 2
        }
    }
    else if (
        questions.intermediate.assessment1.question === null ||
        (
            typeof questions.intermediate.assessment1.question === 'string' &&
            questions.intermediate.assessment1.question.trim() === ''
        )
    ) {
        return {
            instruction: "Ask an intermediate level question.",
            session_id: session_id,
            level: 1,
            assessment_number: 1
        }
    }
    else if (
        questions.intermediate.assessment2.question === null ||
        (
            typeof questions.intermediate.assessment2.question === 'string' &&
            questions.intermediate.assessment2.question.trim() === ''
        )
    ) {
        return {
            instruction: "Ask an intermediate level question.",
            session_id: session_id,
            level: 1,
            assessment_number: 2
        }
    }
    else if (
        questions.advanced.assessment1.question === null ||
        (
            typeof questions.advanced.assessment1.question === 'string' &&
            questions.advanced.assessment1.question.trim() === ''
        )
    ) {
        return {
            instruction: "Ask an advanced level question.",
            session_id: session_id,
            level: 2,
            assessment_number: 1
        }
    }
    else if (
        questions.advanced.assessment2.question === null ||
        (
            typeof questions.advanced.assessment2.question === 'string' &&
            questions.advanced.assessment2.question.trim() === ''
        )
    ) {
        return {
            instruction: "Ask an advanced level question.",
            session_id: session_id,
            level: 2,
            assessment_number: 2
        }
    }
    else {
        return {
            instruction: "You have asked all the questions. Do not ask any more questions.",
            session_id: session_id,
            level: null,
            assessment_number: null
        }
    }
}

export const interviewer_prompt = (session_id) => {
    const response = get_empty_assessment_information(session_id);
    return {
        system_prompt: `You are a professional technical interviewer conducting a focused assessment on React.js and Node.js.

## Core Responsibilities

1. **Question Scope**: Ask questions exclusively about React.js and Node.js technologies. Do not deviate to other topics, frameworks, or languages.

2. **Question Balance**: Maintain equal coverage between React.js and Node.js. Do not show bias toward either technology.

3. **Question Types**: Include both:
   - Theoretical/conceptual questions
   - Code output prediction questions
   - Practical implementation scenarios 
   - strictly, do not tell interviewee to write code, just ask questions about code snippets or concepts

4. **Difficulty Level**: ${response.instruction}

## Interview Protocol

### Question Guidelines
- Ask clear, unambiguous questions with specific context
- Use a professional tone, only ask question.
- Present one question at a time
- Ensure questions are directly relevant to React.js or Node.js

### Response Handling
- Do not evaluate, correct, or comment on their answers
- Do not provide hints, explanations, or clarifications
- Accept whatever response they provide without judgment
- Only ask question, no other words in question. (eg. okay, i got it, next question is...; do not use this types of conversation type words in question.)

### Strict Boundaries
- **DO NOT** answer any questions from the interviewee
- **DO NOT** provide solutions or explanations
- **DO NOT** offer feedback on their answers
- **DO NOT** ask questions outside React.js and Node.js scope
- **DO NOT** react to interviewee answer.

## Workflow

1. Ask a question (React.js or Node.js)
2. Wait for interviewee's response
3. Proceed to next question
4. Repeat until interview completion

Remember: Your role is to assess, not to teach. Maintain strict adherence to these guidelines throughout the interview.
`,
        session_id: response.session_id
    }
}
