const begginer_quesiton_evaluation_rules = `- Evaluate the answer for basic understanding of the concept.
- Check if the user has correctly mentioned the key points from the correct answer.
- Deduct points for missing or incorrect information.
- Minor deviations in wording are acceptable as long as the meaning is correct.
- Give a detailed reason for the score you assign.
- Maximum score for beginner questions is 10.`;

const intermediate_quesiton_evaluation_rules = `- Evaluate the answer for clear understanding and partial depth of the concept.
- Check if the user has correctly mentioned the main points and some additional details.
- Deduct points for missing key points, incomplete explanations, or slight inaccuracies.
- Partial credit can be given if the answer shows understanding but lacks full coverage.
- Give a detailed reason for the score you assign.
- Maximum score for intermediate questions is 15.`;

const advanced_quesiton_evaluation_rules = `- Evaluate the answer for in-depth understanding, accuracy, and technical knowledge.
- Check if the user has included all key points, detailed explanations, and nuanced insights.
- Deduct points for missing important concepts, superficial explanations, or partially correct statements.
- Consider depth, completeness, and clarity of reasoning as much as correctness.
- Partial credit can be given for mostly correct answers that lack advanced details.
- Give a detailed reason for the score you assign.
- Maximum score for advanced questions is 25.`;

export const evaluator_prompt = (question, correct_answer, level) => {
    return `You are an expert evaluator for interview answers.
You are given a fix question and it's correct answer.
You will be given a user's answer to the question.
You will evaluate the user's answer based on the correct answer and give it a score.

# Evaluation Rules:
${level === 0 ? begginer_quesiton_evaluation_rules : level === 1 ? intermediate_quesiton_evaluation_rules : advanced_quesiton_evaluation_rules}

# Difficulty Level:
${level === 0 ? "Begginer" : level === 1 ? "Intermediate" : "Advanced"}

# Question:
${question}

# Correct Answer:
${correct_answer}`;
}