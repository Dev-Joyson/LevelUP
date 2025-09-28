import puppeteer from 'puppeteer';
import { uploadInterviewPDFToCloudinary } from './cloudinaryUpload.js';

class PDFService {
    constructor() {
        // No local storage needed - everything goes to Cloudinary
    }

    // Generate PDF report for completed interview and upload to Cloudinary
    async generateInterviewReport(sessionData) {
        try {
            const { 
                sessionId, 
                studentInfo, 
                mockInterview, 
                finalReport, 
                answers, 
                totalTimeSpent,
                completedAt,
                studentId // Need student ID for Cloudinary upload
            } = sessionData;

            const htmlContent = this.generateReportHTML(sessionData);

            // Launch puppeteer
            const browser = await puppeteer.launch({
                headless: 'new',
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });

            const page = await browser.newPage();
            
            // Set content and generate PDF to buffer
            await page.setContent(htmlContent, { 
                waitUntil: 'networkidle0' 
            });

            // Generate PDF to buffer instead of file
            const pdfBuffer = await page.pdf({
                format: 'A4',
                printBackground: true,
                margin: {
                    top: '20px',
                    right: '20px',
                    bottom: '20px',
                    left: '20px'
                }
            });

            await browser.close();

            // Upload PDF buffer to Cloudinary
            const studentName = studentInfo ? studentInfo.name : 'student';
            const cloudinaryResult = await uploadInterviewPDFToCloudinary(
                pdfBuffer, 
                studentId, 
                sessionId, 
                studentName
            );

            console.log(`PDF uploaded to Cloudinary: ${cloudinaryResult.url}`);

            return {
                success: true,
                cloudinaryUrl: cloudinaryResult.url,
                publicId: cloudinaryResult.publicId,
                uploadedAt: cloudinaryResult.uploadedAt,
                bytes: cloudinaryResult.bytes,
                fileName: `interview_report_${sessionId}_${Date.now()}.pdf`
            };
        } catch (error) {
            console.error('PDF generation/upload error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Generate HTML content for the report
    generateReportHTML(sessionData) {
        const { 
            studentInfo, 
            mockInterview, 
            finalReport, 
            answers, 
            totalTimeSpent,
            completedAt 
        } = sessionData;

        const timeFormatted = Math.round(totalTimeSpent / 60);
        const completedDate = new Date(completedAt).toLocaleDateString();
        
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Interview Report - ${mockInterview.title}</title>
            <style>
                body {
                    font-family: 'Arial', sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 20px;
                }
                .header {
                    text-align: center;
                    border-bottom: 3px solid #2563eb;
                    padding-bottom: 20px;
                    margin-bottom: 30px;
                }
                .header h1 {
                    color: #2563eb;
                    margin: 0;
                    font-size: 28px;
                }
                .header p {
                    color: #6b7280;
                    margin: 5px 0;
                }
                .info-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                    margin-bottom: 30px;
                }
                .info-card {
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    padding: 15px;
                }
                .info-card h3 {
                    margin: 0 0 10px 0;
                    color: #1f2937;
                    font-size: 16px;
                }
                .score-section {
                    background: linear-gradient(135deg, #2563eb, #3b82f6);
                    color: white;
                    border-radius: 12px;
                    padding: 25px;
                    text-align: center;
                    margin: 30px 0;
                }
                .overall-score {
                    font-size: 48px;
                    font-weight: bold;
                    margin: 0;
                }
                .score-text {
                    font-size: 18px;
                    margin: 10px 0 0 0;
                }
                .category-scores {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 15px;
                    margin: 20px 0;
                }
                .category-score {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 8px;
                    padding: 15px;
                    text-align: center;
                }
                .category-score h4 {
                    margin: 0 0 5px 0;
                    font-size: 14px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .category-score .score {
                    font-size: 24px;
                    font-weight: bold;
                    margin: 0;
                }
                .section {
                    margin: 30px 0;
                }
                .section h2 {
                    color: #1f2937;
                    border-bottom: 2px solid #e5e7eb;
                    padding-bottom: 10px;
                    margin-bottom: 15px;
                }
                .strengths, .weaknesses, .improvements {
                    margin: 20px 0;
                }
                .strengths h3 { color: #059669; }
                .weaknesses h3 { color: #dc2626; }
                .improvements h3 { color: #d97706; }
                .list-item {
                    background: #f9fafb;
                    border-left: 4px solid #e5e7eb;
                    margin: 8px 0;
                    padding: 10px 15px;
                    border-radius: 0 6px 6px 0;
                }
                .strengths .list-item { border-left-color: #10b981; }
                .weaknesses .list-item { border-left-color: #ef4444; }
                .improvements .list-item { border-left-color: #f59e0b; }
                .answers-section {
                    margin-top: 40px;
                }
                .answer-item {
                    background: #ffffff;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    margin: 20px 0;
                    padding: 20px;
                }
                .question {
                    font-weight: bold;
                    color: #1f2937;
                    margin-bottom: 10px;
                }
                .student-answer {
                    background: #f0f9ff;
                    border-left: 4px solid #3b82f6;
                    padding: 15px;
                    margin: 10px 0;
                    border-radius: 0 6px 6px 0;
                }
                .ai-feedback {
                    background: #f0fdf4;
                    border-left: 4px solid #22c55e;
                    padding: 15px;
                    margin: 10px 0;
                    border-radius: 0 6px 6px 0;
                }
                .answer-score {
                    display: inline-block;
                    background: #2563eb;
                    color: white;
                    padding: 5px 12px;
                    border-radius: 20px;
                    font-size: 14px;
                    font-weight: bold;
                    margin-bottom: 10px;
                }
                .footer {
                    text-align: center;
                    margin-top: 50px;
                    padding-top: 20px;
                    border-top: 1px solid #e5e7eb;
                    color: #6b7280;
                    font-size: 14px;
                }
                @media print {
                    body { margin: 0; }
                    .info-grid { grid-template-columns: 1fr; }
                    .category-scores { grid-template-columns: 1fr; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Mock Interview Report</h1>
                <p>Generated on ${completedDate}</p>
                <p>LevelUP - AI-Powered Interview System</p>
            </div>

            <div class="info-grid">
                <div class="info-card">
                    <h3>Student Information</h3>
                    <p><strong>Name:</strong> ${studentInfo.name}</p>
                    <p><strong>Email:</strong> ${studentInfo.email}</p>
                </div>
                <div class="info-card">
                    <h3>Interview Details</h3>
                    <p><strong>Title:</strong> ${mockInterview.title}</p>
                    <p><strong>Domain:</strong> ${mockInterview.domain}</p>
                    <p><strong>Difficulty:</strong> ${mockInterview.difficulty}</p>
                    <p><strong>Duration:</strong> ${timeFormatted} minutes</p>
                </div>
            </div>

            <div class="score-section">
                <p class="overall-score">${finalReport.overallScore}/100</p>
                <p class="score-text">Overall Performance Score</p>
                <p style="margin-top: 15px; font-style: italic;">${this.getRecommendationMessage(finalReport.recommendation)}</p>
                
                ${finalReport.categoryScores ? `
                <div class="category-scores">
                    <div class="category-score">
                        <h4>Technical</h4>
                        <p class="score">${finalReport.categoryScores.technical || 0}</p>
                    </div>
                    <div class="category-score">
                        <h4>Communication</h4>
                        <p class="score">${finalReport.categoryScores.communication || 0}</p>
                    </div>
                    <div class="category-score">
                        <h4>Problem Solving</h4>
                        <p class="score">${finalReport.categoryScores.problemSolving || 0}</p>
                    </div>
                </div>
                ` : ''}
            </div>

            <div class="section">
                <h2>Performance Summary</h2>
                <p style="font-size: 16px; line-height: 1.8; background: #f8fafc; padding: 20px; border-radius: 8px;">
                    ${finalReport.summary}
                </p>
            </div>

            ${finalReport.strengths && finalReport.strengths.length > 0 ? `
            <div class="strengths">
                <h3>💪 Key Strengths</h3>
                ${finalReport.strengths.map(strength => `<div class="list-item">${strength}</div>`).join('')}
            </div>
            ` : ''}

            ${finalReport.weaknesses && finalReport.weaknesses.length > 0 ? `
            <div class="weaknesses">
                <h3>⚠️ Areas for Improvement</h3>
                ${finalReport.weaknesses.map(weakness => `<div class="list-item">${weakness}</div>`).join('')}
            </div>
            ` : ''}

            ${finalReport.improvementSuggestions && finalReport.improvementSuggestions.length > 0 ? `
            <div class="improvements">
                <h3>📈 Improvement Recommendations</h3>
                ${finalReport.improvementSuggestions.map(suggestion => `<div class="list-item">${suggestion}</div>`).join('')}
            </div>
            ` : ''}

            <div class="answers-section">
                <h2>Question-by-Question Analysis</h2>
                ${answers.map((answer, index) => `
                    <div class="answer-item">
                        <div class="question">Question ${index + 1}:</div>
                        <div class="student-answer">
                            <strong>Your Answer:</strong><br>
                            ${answer.studentAnswer || 'No answer provided'}
                        </div>
                        ${answer.aiEvaluation ? `
                            <div class="answer-score">Score: ${answer.aiEvaluation.score}/100</div>
                            <div class="ai-feedback">
                                <strong>AI Feedback:</strong><br>
                                ${answer.aiEvaluation.feedback}
                            </div>
                        ` : ''}
                    </div>
                `).join('')}
            </div>

            <div class="footer">
                <p>This report was generated by LevelUP's AI-powered interview system.</p>
                <p>For questions or feedback, please contact our support team.</p>
                <p>© ${new Date().getFullYear()} LevelUP. All rights reserved.</p>
            </div>
        </body>
        </html>
        `;
    }

    // Get recommendation message based on performance
    getRecommendationMessage(recommendation) {
        const messages = {
            'Excellent': 'Outstanding performance! You demonstrated strong expertise across all areas.',
            'Good': 'Good performance with solid understanding. Minor improvements will take you to the next level.',
            'Average': 'Average performance. Focus on the improvement areas to enhance your skills.',
            'Needs Improvement': 'There\'s room for growth. Use the recommendations to strengthen your foundation.',
            'Poor': 'Consider more preparation and practice. Focus on the fundamental concepts.'
        };
        return messages[recommendation] || 'Performance evaluated successfully.';
    }

    // Note: PDF cleanup is now handled by Cloudinary's management features
    // No local file cleanup needed since we store everything in Cloudinary
}

export default new PDFService();

