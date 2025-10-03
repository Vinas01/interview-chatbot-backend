export const get_correct_answer_prompt = (question, level) => {
    const difficultyLevels = {
        0: 'beginner',
        1: 'intermediate',
        2: 'advanced'
    };
    
    const difficultyDescriptions = {
        0: 'Provide a clear, foundational answer suitable for someone new to the topic. Focus on core concepts and avoid technical jargon.',
        1: 'Provide a detailed answer that assumes basic knowledge. Include relevant examples and explain key concepts with moderate technical depth.',
        2: 'Provide a comprehensive, expert-level answer. Include technical details, edge cases, best practices, and industry-standard approaches.'
    };
    
    return `You are an expert interview coach providing tailored answers for technical interview questions.

QUESTION:
${question}

DIFFICULTY LEVEL: ${difficultyLevels[level] || 'intermediate'}

INSTRUCTIONS:
${difficultyDescriptions[level] || difficultyDescriptions[1]}

RESPONSE REQUIREMENTS:
- Answer directly and concisely without introductory phrases
- Structure your response with clear, logical flow
- Use plain text only - no markdown formatting, bullet points, or special characters
- Keep the answer appropriate for the difficulty level - neither too basic nor too complex
- Focus only on answering the specific question asked
- Do not add meta-commentary or disclaimers

Provide the answer now.`;
}




