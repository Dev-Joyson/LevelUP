import axios from 'axios';

const {
  AZURE_OPENAI_API_KEY,
  AZURE_OPENAI_ENDPOINT,
  AZURE_OPENAI_DEPLOYMENT_NAME,
  AZURE_OPENAI_API_VERSION
} = process.env;

class OpenAIService {
    constructor() {
        this.endpoint = AZURE_OPENAI_ENDPOINT;
        this.apiKey = AZURE_OPENAI_API_KEY;
        this.deploymentName = AZURE_OPENAI_DEPLOYMENT_NAME;
        this.apiVersion = AZURE_OPENAI_API_VERSION;
        this.maxTokens = 1000;
    }

    // Make Azure OpenAI API call
    async makeAzureOpenAICall(messages, maxTokens = this.maxTokens, temperature = 0.7) {
        try {
            const response = await axios.post(
                `${this.endpoint}/openai/deployments/${this.deploymentName}/chat/completions?api-version=${this.apiVersion}`,
                {
                    messages,
                    max_tokens: maxTokens,
                    temperature
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'api-key': this.apiKey
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error('Azure OpenAI API Error:', error.response?.data || error.message);
            throw error;
        }
    }

    // Generate interview questions based on domain and difficulty
    async generateQuestions(domain, difficulty, numberOfQuestions, jobRole = null) {
        try {
            const prompt = this.buildQuestionGenerationPrompt(domain, difficulty, numberOfQuestions, jobRole);
            
            const messages = [
                {
                    role: "system",
                    content: "You are an expert technical interviewer. Generate realistic, well-structured interview questions in JSON format. Always return valid JSON without markdown code blocks."
                },
                {
                    role: "user",
                    content: prompt
                }
            ];

            const completion = await this.makeAzureOpenAICall(messages, this.maxTokens, 0.7);
            
            let content = completion.choices[0].message.content.trim();
            // Clean up any markdown formatting that might be returned
            if (content.startsWith("```")) {
                content = content.replace(/```json|```/g, "").trim();
            }
            
            const parsedResponse = JSON.parse(content);
            
            return {
                success: true,
                questions: parsedResponse.questions,
                metadata: {
                    model: this.deploymentName,
                    tokens: completion.usage?.total_tokens || 0,
                    generatedAt: new Date(),
                    prompt: prompt
                }
            };
        } catch (error) {
            console.error('Error generating questions:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Evaluate student's answer to a question
    async evaluateAnswer(question, studentAnswer, expectedAnswer = null, keyPoints = []) {
        try {
            const prompt = this.buildAnswerEvaluationPrompt(question, studentAnswer, expectedAnswer, keyPoints);
            
            const messages = [
                {
                    role: "system",
                    content: "You are an expert technical interviewer. Evaluate answers objectively and provide constructive feedback in JSON format. Always return valid JSON without markdown code blocks."
                },
                {
                    role: "user",
                    content: prompt
                }
            ];

            const completion = await this.makeAzureOpenAICall(messages, 800, 0.3);
            
            let content = completion.choices[0].message.content.trim();
            // Clean up any markdown formatting that might be returned
            if (content.startsWith("```")) {
                content = content.replace(/```json|```/g, "").trim();
            }
            
            const parsedResponse = JSON.parse(content);
            
            return {
                success: true,
                evaluation: {
                    score: parsedResponse.score,
                    feedback: parsedResponse.feedback,
                    strengths: parsedResponse.strengths || [],
                    improvements: parsedResponse.improvements || [],
                    keyPointsCovered: parsedResponse.keyPointsCovered || [],
                    evaluatedAt: new Date(),
                    model: this.deploymentName
                },
                metadata: {
                    tokens: completion.usage?.total_tokens || 0
                }
            };
        } catch (error) {
            console.error('Error evaluating answer:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Generate final interview summary report
    async generateInterviewSummary(sessionData) {
        try {
            const prompt = this.buildSummaryPrompt(sessionData);
            
            const messages = [
                {
                    role: "system",
                    content: "You are an expert career counselor and technical interviewer. Generate comprehensive interview reports in JSON format. Always return valid JSON without markdown code blocks."
                },
                {
                    role: "user",
                    content: prompt
                }
            ];

            const completion = await this.makeAzureOpenAICall(messages, 1200, 0.4);
            
            let content = completion.choices[0].message.content.trim();
            // Clean up any markdown formatting that might be returned
            if (content.startsWith("```")) {
                content = content.replace(/```json|```/g, "").trim();
            }
            
            const parsedResponse = JSON.parse(content);
            
            return {
                success: true,
                summary: {
                    overallScore: parsedResponse.overallScore,
                    categoryScores: parsedResponse.categoryScores || {},
                    strengths: parsedResponse.strengths || [],
                    weaknesses: parsedResponse.weaknesses || [],
                    improvementSuggestions: parsedResponse.improvementSuggestions || [],
                    summary: parsedResponse.summary,
                    recommendation: parsedResponse.recommendation,
                    generatedAt: new Date()
                },
                metadata: {
                    tokens: completion.usage?.total_tokens || 0
                }
            };
        } catch (error) {
            console.error('Error generating summary:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Helper method to build question generation prompt
    buildQuestionGenerationPrompt(domain, difficulty, numberOfQuestions, jobRole) {
        return `Generate ${numberOfQuestions} interview questions for the domain "${domain}" at "${difficulty}" difficulty level${jobRole ? ` for a ${jobRole} position` : ''}.

Requirements:
- Questions should be realistic and commonly asked in actual interviews
- Mix of theoretical concepts, practical scenarios, and problem-solving
- Each question should have expected key points for evaluation
- Appropriate difficulty progression
- Include estimated time to answer (in minutes)
- Categorize each question as ONE of: Technical, Behavioral, Problem Solving, System Design, or Coding

Return response in this JSON format:
{
    "questions": [
        {
            "questionText": "Question here",
            "difficulty": "${difficulty}",
            "category": "Technical", // Choose ONE from: Technical, Behavioral, Problem Solving, System Design, Coding
            "keyPoints": ["key point 1", "key point 2"],
            "expectedAnswer": "Brief expected answer guidance",
            "estimatedTime": 5
        }
    ]
}`;
    }

    // Helper method to build answer evaluation prompt
    buildAnswerEvaluationPrompt(question, studentAnswer, expectedAnswer, keyPoints) {
        return `Evaluate this interview answer:

Question: "${question}"
Student Answer: "${studentAnswer}"
${expectedAnswer ? `Expected Answer Guidance: "${expectedAnswer}"` : ''}
${keyPoints.length > 0 ? `Key Points to Look For: ${keyPoints.join(', ')}` : ''}

Provide objective evaluation focusing on:
- Technical accuracy
- Completeness of answer
- Communication clarity
- Practical understanding

Return response in this JSON format:
{
    "score": 85,
    "feedback": "Detailed feedback on the answer",
    "strengths": ["strength 1", "strength 2"],
    "improvements": ["area for improvement 1", "area 2"],
    "keyPointsCovered": ["covered point 1", "covered point 2"]
}

Score should be 0-100 where:
- 90-100: Excellent, comprehensive answer
- 80-89: Good answer with minor gaps
- 70-79: Adequate answer, some important points covered
- 60-69: Basic understanding, significant gaps
- Below 60: Poor understanding or major inaccuracies`;
    }

    // Helper method to build summary prompt
    buildSummaryPrompt(sessionData) {
        const { mockInterview, answers, totalTimeSpent, questionsAttempted } = sessionData;
        
        const answersText = answers.map((answer, index) => 
            `Question ${index + 1}: ${answer.studentAnswer} (Score: ${answer.aiEvaluation?.score || 0})`
        ).join('\n');

        return `Generate a comprehensive interview summary report:

Interview Details:
- Domain: ${mockInterview.domain}
- Difficulty: ${mockInterview.difficulty}
- Total Questions: ${mockInterview.numberOfQuestions}
- Questions Attempted: ${questionsAttempted}
- Total Time: ${Math.round(totalTimeSpent / 60)} minutes

Student Responses:
${answersText}

Performance Analysis:
${answers.map(a => `Q: Score ${a.aiEvaluation?.score || 0} - ${a.aiEvaluation?.feedback || 'No feedback'}`).join('\n')}

Return comprehensive analysis in this JSON format:
{
    "overallScore": 78,
    "categoryScores": {
        "technical": 80,
        "communication": 75,
        "problemSolving": 82
    },
    "strengths": ["strength 1", "strength 2", "strength 3"],
    "weaknesses": ["area to improve 1", "area 2"],
    "improvementSuggestions": ["specific suggestion 1", "suggestion 2", "suggestion 3"],
    "summary": "Detailed 2-3 sentence summary of overall performance",
    "recommendation": "Excellent/Good/Average/Needs Improvement/Poor"
}`;
    }
}

export default new OpenAIService();
