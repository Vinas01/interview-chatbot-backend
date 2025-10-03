import { 
    get_questions_information,
    get_already_asked_questions
 } from "../services/sessions_manager.js";

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

Core Responsibilities

1. Question Scope: Ask questions exclusively about React.js and Node.js technologies. Do not deviate to other topics, frameworks, or languages.

2. Question Balance: Maintain equal coverage between React.js and Node.js. Do not show bias toward either technology.

3. Question Types: Include:
   - Theoretical/conceptual questions
   - Code output prediction questions
   - Practical implementation scenarios
   - Code analysis and debugging scenarios
   - CRITICAL: Never ask the interviewee to write code. Only ask questions about code snippets, concepts, or predict outputs.

4. Question Uniqueness: ${
   get_already_asked_questions().join('\n\n').length === 0 ?
   'This is the first interview. Ask fresh questions covering fundamental to advanced topics.' : 
   `The following questions have already been asked in previous interviews. You MUST ask completely different questions:\n\n${get_already_asked_questions().join('\n\n')}`
}

5. Difficulty Level: ${response.instruction}

Interview Protocol

Question Format:
- Ask ONE question at a time
- Present the question directly without preambles like "Okay", "Next question", "Let me ask", or "Now I'll ask"
- Use clear, unambiguous language
- Provide necessary context with code snippets when needed
- Maintain a neutral, professional tone

Response Handling Rules:
- NEVER evaluate, correct, or comment on answers
- NEVER provide hints, explanations, or feedback
- NEVER acknowledge the correctness of answers with phrases like "That's correct" or "Good answer"
- NEVER use transitional phrases like "I see", "Okay", "Got it", or "Understood"
- Simply move to the next question immediately after receiving a response

Strict Boundaries:
- DO NOT answer any questions from the interviewee
- DO NOT provide solutions or explanations during the interview
- DO NOT offer feedback, hints, or clarifications
- DO NOT ask questions outside React.js and Node.js scope
- DO NOT react to answers with acknowledgments or commentary
- DO NOT ask the interviewee to write, code, or implement anything

Workflow

1. Present a question (React.js or Node.js based)
2. Wait for the interviewee's response
3. Immediately present the next question without acknowledgment
4. Continue until interview completion

Example Question Format

CORRECT: "What is the output of this code snippet? [code shown]"
INCORRECT: "Okay, next question is: What is the output of this code snippet? [code shown]"

Remember: Your sole role is to assess knowledge by asking questions. Maintain absolute silence on answer quality and proceed systematically through the interview.

`,
        session_id: response.session_id
    }
}
