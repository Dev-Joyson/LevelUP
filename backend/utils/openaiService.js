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
                    content: "You are a well-experienced senior technical interviewer with 10+ years of experience in your field. You have conducted hundreds of technical interviews and know exactly what questions reveal a candidate's true capabilities. Generate realistic, industry-standard interview questions in JSON format. Always return valid JSON without markdown code blocks."
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
                    content: "You are a well-experienced senior technical interviewer with 10+ years of experience conducting interviews in your field. You have interviewed hundreds of candidates and have a deep understanding of what makes a good answer. You are known for your fair but strict evaluation standards. Evaluate answers objectively and provide constructive feedback in JSON format. Always return valid JSON without markdown code blocks."
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
            
            // Server-side validation to catch overly lenient AI scoring
            const validatedScore = this.validateAndAdjustScore(parsedResponse.score, studentAnswer, question);
            
            return {
                success: true,
                evaluation: {
                    score: validatedScore.score,
                    feedback: validatedScore.adjustedFeedback || parsedResponse.feedback,
                    strengths: parsedResponse.strengths || [],
                    improvements: parsedResponse.improvements || [],
                    keyPointsCovered: parsedResponse.keyPointsCovered || [],
                    isRelevant: parsedResponse.isRelevant !== undefined ? parsedResponse.isRelevant : true,
                    evaluatedAt: new Date(),
                    model: this.deploymentName,
                    scoreAdjusted: validatedScore.adjusted
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
                    content: "You are a well-experienced senior technical interviewer and career counselor with 10+ years of experience. You have evaluated thousands of candidates and have a deep understanding of what companies look for in technical hires. You provide honest, constructive feedback that helps candidates improve. Generate comprehensive interview reports in JSON format. Always return valid JSON without markdown code blocks."
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
            
            // Server-side score validation and calculation as backup
            const actualScores = sessionData.answers
                .filter(a => a.aiEvaluation?.score !== undefined)
                .map(a => a.aiEvaluation.score);
            
            const calculatedOverallScore = actualScores.length > 0 
                ? Math.round(actualScores.reduce((sum, score) => sum + score, 0) / actualScores.length)
                : 0;
            
            // Use calculated score if AI returned suspicious static values
            let finalOverallScore = parsedResponse.overallScore;
            let scoreAdjusted = false;
            
            if (parsedResponse.overallScore === 78 || parsedResponse.overallScore === 80 || parsedResponse.overallScore === 75) {
                finalOverallScore = calculatedOverallScore;
                scoreAdjusted = true;
                console.log(`⚠️ SCORE CORRECTED: AI returned suspicious static score ${parsedResponse.overallScore}, corrected to calculated ${calculatedOverallScore}`);
            }
            
            // Verify recommendation matches the score
            const getRecommendationForScore = (score) => {
                if (score >= 90) return "Excellent";
                if (score >= 75) return "Good";
                if (score >= 60) return "Average";
                if (score >= 40) return "Needs Improvement";
                return "Poor";
            };
            
            const correctRecommendation = getRecommendationForScore(finalOverallScore);
            const recommendationAdjusted = parsedResponse.recommendation !== correctRecommendation;
            
            return {
                success: true,
                summary: {
                    overallScore: finalOverallScore,
                    categoryScores: parsedResponse.categoryScores || {},
                    strengths: parsedResponse.strengths || [],
                    weaknesses: parsedResponse.weaknesses || [],
                    improvementSuggestions: parsedResponse.improvementSuggestions || [],
                    summary: parsedResponse.summary,
                    recommendation: correctRecommendation,
                    generatedAt: new Date(),
                    scoreAdjusted,
                    recommendationAdjusted,
                    calculatedScore: calculatedOverallScore
                },
                metadata: {
                    tokens: completion.usage?.total_tokens || 0,
                    actualScores: actualScores
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

    // Server-side validation to catch overly lenient AI scoring
    validateAndAdjustScore(aiScore, studentAnswer, question) {
        const answerLength = studentAnswer.trim().split(' ').length;
        const answerLower = studentAnswer.toLowerCase().trim();
        let adjustedScore = aiScore;
        let adjustedFeedback = null;
        let adjusted = false;

        // Enhanced validation for guidance-based evaluation
        const isGuidanceQuestion = question.toLowerCase().includes('explain') || 
                                  question.toLowerCase().includes('discuss') || 
                                  question.toLowerCase().includes('compare') ||
                                  question.toLowerCase().includes('describe');

        // Red flags that should result in very low scores
        const redFlags = [
            answerLength <= 5, // Extremely short answers
            answerLength <= 10 && !answerLower.includes('because') && !answerLower.includes('difference') && !answerLower.includes('example'), // Short without explanation
            answerLower === 'yes' || answerLower === 'no' || answerLower === 'good' || answerLower === 'bad',
            answerLower.includes('efficient') && answerLength < 8, // Generic efficiency claims without explanation
            answerLower.includes('works well') && answerLength < 10,
            answerLower.includes('it is good') || answerLower.includes('it\'s good'),
        ];

        // Check for answers that are just stating obvious facts without explanation
        const obviousStatements = [
            'are efficient', 'is efficient', 'works well', 'is good', 'are good', 
            'is better', 'are better', 'is faster', 'are faster', 'is useful'
        ];
        const hasOnlyObviousStatement = obviousStatements.some(statement => 
            answerLower.includes(statement) && answerLength <= 10
        );

        // Apply strict validation
        if (redFlags.some(flag => flag) || hasOnlyObviousStatement) {
            if (aiScore > 25) {
                adjustedScore = Math.min(aiScore, 15); // Cap at 15 for terrible answers
                adjustedFeedback = "Your answer is too brief and lacks technical depth. A good technical interview answer should explain concepts thoroughly with specific details.";
                adjusted = true;
                console.log(`⚠️ SCORE ADJUSTED: AI gave ${aiScore}, adjusted to ${adjustedScore} for inadequate answer: "${studentAnswer.substring(0, 50)}..."`);
            }
        }

        // Additional check: Enhanced validation for guidance-based questions
        if (isGuidanceQuestion && answerLength < 20 && aiScore > 35) {
            adjustedScore = Math.min(aiScore, 25);
            adjustedFeedback = adjustedFeedback || "This question has specific guidance requirements that expect detailed explanations. Your answer is too brief to address what the guidance expects.";
            adjusted = true;
            console.log(`⚠️ GUIDANCE MISMATCH: AI gave ${aiScore}, adjusted to ${adjustedScore} for insufficient guidance compliance`);
        }

        // Extra strict validation for complex multi-part questions
        const isMultiPartQuestion = (question.match(/and|discuss|explain.*scenarios|compare.*and/g) || []).length >= 2;
        if (isMultiPartQuestion && answerLength < 25 && aiScore > 40) {
            adjustedScore = Math.min(aiScore, 30);
            adjustedFeedback = adjustedFeedback || "This multi-part question requires comprehensive answers addressing all aspects. Your response is too brief for the complexity expected.";
            adjusted = true;
            console.log(`⚠️ MULTI-PART QUESTION: AI gave ${aiScore}, adjusted to ${adjustedScore} for inadequate coverage`);
        }

        return {
            score: adjustedScore,
            adjustedFeedback,
            adjusted
        };
    }

    // Helper method to build question generation prompt
    buildQuestionGenerationPrompt(domain, difficulty, numberOfQuestions, jobRole) {
        return `As a senior technical interviewer with 10+ years of experience, create ${numberOfQuestions} interview questions for the domain "${domain}" at "${difficulty}" difficulty level${jobRole ? ` for a ${jobRole} position` : ''}.

Based on my years of conducting interviews, I need questions that:
- Are ACTUALLY asked in real company interviews (not textbook questions)
- Reveal genuine understanding vs memorized answers
- Test both theoretical knowledge and practical application
- Distinguish between junior, mid-level, and senior candidates
- Include some tricky aspects that only experienced developers know

Professional Interview Design Standards:
- Questions should match real industry scenarios
- Include follow-up potential to probe deeper
- Test critical thinking, not just recall
- Have clear evaluation criteria
- Reflect current industry practices and technologies

For each question, provide the key points I would look for as an experienced interviewer, and create GUIDANCE (not static answers) for evaluation:

Return response in this JSON format:
{
    "questions": [
        {
            "questionText": "Realistic industry-relevant question here",
            "difficulty": "${difficulty}",
            "category": "Technical", // Choose ONE from: Technical, Behavioral, Problem Solving, System Design, Coding
            "keyPoints": ["specific technical point I'd look for", "practical understanding I'd expect", "red flag if missing"],
            "expectedAnswer": "A good answer should explain [main concept]. Should mention [key technical aspects]. Should demonstrate understanding of [practical applications]. Should provide examples of [use cases/scenarios].",
            "estimatedTime": 5
        }
    ]
}

CRITICAL: The expectedAnswer field must be GUIDANCE format, not a direct answer. Always use patterns like:
- "A good answer should explain..."  
- "Should mention..."
- "Should demonstrate understanding of..."
- "Should provide examples of..."
- "Should discuss..."
- "Should compare/contrast..."

EXAMPLES of proper expectedAnswer guidance format:
✅ "A good answer should explain how React hooks work internally. Should mention useState and useEffect specifically. Should demonstrate understanding of the component lifecycle. Should provide examples of when to use different hooks."

❌ "React hooks are functions that let you use state in functional components."

Note: These questions should be the kind that separate strong candidates from weak ones in real interviews.`;
    }

    // Helper method to build answer evaluation prompt
    buildAnswerEvaluationPrompt(question, studentAnswer, expectedAnswer, keyPoints) {
        return `As a senior technical interviewer with 10+ years of experience, evaluate this interview answer with the same standards you would use in a real company interview:

Question: "${question}"
Student Answer: "${studentAnswer}"
${expectedAnswer ? `Expected Answer Guidance: "${expectedAnswer}"` : ''}
${keyPoints.length > 0 ? `Key Points to Look For: ${keyPoints.join(', ')}` : ''}

GUIDANCE-BASED INTELLIGENT EVALUATION:
The Expected Answer Guidance tells you what elements a good answer SHOULD contain. Use it as your evaluation framework:
- Check if student's answer addresses what the guidance says "should explain"
- Verify if they mention what the guidance says "should mention" 
- See if they demonstrate what the guidance says "should demonstrate"
- Look for examples if guidance says "should provide examples"
- Score based on how well they fulfill the guidance requirements

CRITICAL INTERVIEWER EVALUATION STANDARDS - BE EXTREMELY STRICT:
- IMMEDIATE REJECTION: Completely unrelated answers (score: 0-5)
- VERY POOR: One-liner answers with no explanation like "b trees are efficient" (score: 5-15)
- POOR: Vague, buzzword-filled answers without substance (score: 15-35) 
- CONCERNING: Partially correct but missing major concepts (score: 35-60)
- ACCEPTABLE: Good understanding with minor gaps (score: 60-75)
- STRONG: Comprehensive answer demonstrating deep knowledge (score: 75-90)
- OUTSTANDING: Exceptional answer with practical insights (score: 90-100)

EXAMPLES OF UNACCEPTABLE ANSWERS (should score 5-15):
- "b trees are efficient" (for a complex B-tree question)
- "it works well" (for any technical question)
- "yes, it's good" (for explanation questions)
- Single sentences without any technical details
- Answers that completely ignore the question complexity

Evaluate like you're deciding whether to recommend this candidate to your hiring team:

Technical Evaluation Criteria:
1. Technical accuracy (most critical - wrong information is a red flag)
2. Relevance to the question (off-topic answers indicate poor listening skills)
3. Depth of understanding (surface-level vs deep knowledge)
4. Practical application knowledge (theory + real-world experience)
5. Communication clarity (can they explain complex concepts simply?)

Return your professional assessment in this JSON format:
{
    "score": [CALCULATE ACTUAL SCORE 0-100 based on guidance compliance and key points],
    "feedback": "Professional feedback referencing what the guidance expected vs what student provided",
    "strengths": ["specific aspect from guidance that student addressed well", "key point student covered effectively"],
    "improvements": ["guidance requirement student missed", "key point student should have included based on guidance"],
    "keyPointsCovered": ["key point they covered well", "another key point"],
    "isRelevant": true
}

IMPORTANT: Calculate the actual score based on how well the student's answer meets the guidance requirements. Do NOT use static numbers like 85.

FEEDBACK INSTRUCTIONS:
- Reference the guidance requirements in your feedback
- Mention what the guidance expected that the student did/didn't provide  
- Be specific about which guidance elements were missed
- Example: "The guidance expected you to explain the structural differences and provide use case examples, but your answer only mentioned efficiency without explanation."

STRICT Professional Scoring Standards (be HARSH like a real interviewer):

AUTOMATIC LOW SCORES for these patterns:
- Answer has less than 10 words: MAX score 15
- Answer doesn't address the question: MAX score 10
- Answer is just a statement without explanation: MAX score 20
- Answer shows zero technical understanding: MAX score 15

GUIDANCE-BASED SCORING BREAKDOWN:
- 90-100: EXCEPTIONAL - Addresses ALL guidance requirements comprehensively, covers all key points with deep expertise
- 75-89: STRONG - Meets most guidance requirements, covers majority of key points with good technical knowledge  
- 60-74: ACCEPTABLE - Addresses main guidance points, covers some key points, meets minimum requirements
- 40-59: WEAK - Partially addresses guidance, misses several key points, significant gaps for technical role
- 20-39: VERY POOR - Barely addresses guidance requirements, fundamental misunderstanding
- 5-19: UNACCEPTABLE - Ignores guidance requirements completely, inadequate response
- 0-4: NONSENSICAL - Completely unrelated or no meaningful content

GUIDANCE COMPLIANCE SCORING:
- If guidance says "should explain X" and student doesn't explain X → Major point deduction
- If guidance says "should mention Y" and student doesn't mention Y → Point deduction  
- If guidance says "should provide examples" and student provides no examples → Point deduction
- If guidance says "should demonstrate understanding" and answer shows no understanding → Low score

CRITICAL: If an answer is shorter than 20 words for a complex technical question, it should score below 25 points regardless of content. One-sentence answers to multi-part guidance requirements are automatic red flags.

Remember: The guidance is your evaluation roadmap. Score based on how well the student fulfills what the guidance expects, not just technical accuracy alone.`;
    }

    // Helper method to build summary prompt
    buildSummaryPrompt(sessionData) {
        const { mockInterview, answers, totalTimeSpent, questionsAttempted } = sessionData;
        
        const answersText = answers.map((answer, index) => 
            `Question ${index + 1}: ${answer.studentAnswer} (Score: ${answer.aiEvaluation?.score || 0})`
        ).join('\n');

        return `As a senior technical interviewer with 10+ years of experience, provide a comprehensive assessment of this candidate's interview performance. Write this as if you're briefing the hiring manager on whether to move this candidate forward.

Interview Session Details:
- Domain: ${mockInterview.domain}
- Difficulty: ${mockInterview.difficulty}
- Total Questions: ${mockInterview.numberOfQuestions}
- Questions Attempted: ${questionsAttempted}
- Total Time: ${Math.round(totalTimeSpent / 60)} minutes

Candidate Responses with My Evaluation Scores:
${answersText}

Detailed Performance Analysis:
${answers.map(a => `Q: Score ${a.aiEvaluation?.score || 0} - ${a.aiEvaluation?.feedback || 'No feedback'}`).join('\n')}

Based on my experience interviewing hundreds of candidates in this field, provide your professional assessment:

CALCULATE THE ACTUAL SCORES based on the candidate's performance data above. DO NOT use static numbers.

SCORE CALCULATION INSTRUCTIONS:
1. Calculate overallScore as the mathematical average of all individual question scores shown above
   Example: If questions scored [85, 40, 85, 85, 85], then overallScore = (85+40+85+85+85)/5 = 76

2. Calculate categoryScores based on actual performance patterns observed:
   - technical: Average score of technical accuracy across all answers (0-100)
   - communication: Score based on explanation clarity and completeness (0-100)
   - problemSolving: Score based on logical reasoning and problem-solving approach (0-100)

3. Recommendation must match the calculated overallScore:
   - 90-100: "Excellent"
   - 75-89: "Good" 
   - 60-74: "Average"
   - 40-59: "Needs Improvement"
   - 0-39: "Poor"

Return your hiring recommendation in this JSON format:
{
    "overallScore": [CALCULATE ACTUAL AVERAGE SCORE],
    "categoryScores": {
        "technical": [CALCULATE BASED ON TECHNICAL ACCURACY],
        "communication": [CALCULATE BASED ON EXPLANATION QUALITY],
        "problemSolving": [CALCULATE BASED ON REASONING SHOWN]
    },
    "strengths": ["specific technical strength observed", "communication strength", "problem-solving ability"],
    "weaknesses": ["specific technical gap", "area needing development"],
    "improvementSuggestions": ["actionable suggestion for technical growth", "specific resource or practice to improve", "career development advice"],
    "summary": "Professional summary as you would give to a hiring manager - honest assessment of candidate's readiness",
    "recommendation": "Excellent"
}

CRITICAL: You MUST calculate real scores based on the actual performance data provided above. DO NOT use example numbers like 78, 80, 75, 82.

CRITICAL: The recommendation field must be EXACTLY one of these values:
- "Excellent" (90-100): Outstanding performance, would strongly recommend for hire
- "Good" (75-89): Solid performance, would recommend with confidence  
- "Average" (60-74): Adequate performance, meets basic requirements
- "Needs Improvement" (40-59): Below expectations, significant development needed
- "Poor" (0-39): Unacceptable performance, would not recommend for hire

Remember: Your reputation as an interviewer depends on accurate assessment. Be honest about both strengths and areas for improvement.`;
    }
}

export default new OpenAIService();
