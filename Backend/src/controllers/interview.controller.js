const { PDFParse } = require("pdf-parse")
const { generateInterviewReport, generateResumePdf } = require("../services/ai.service")
const interviewReportModel = require("../models/interviewReport.model")

function getReportTitle(jobDescription, generatedTitle) {
    if (typeof generatedTitle === "string" && generatedTitle.trim()) {
        return generatedTitle.trim()
    }

    const titleMatch = jobDescription.match(
        /(?:job\s*title|role|position)\s*:\s*(.{1,120}?)(?=\s*(?:location|type|key responsibilities|job overview)\s*:|$)/i
    )
    return titleMatch?.[1].trim() || "Interview Preparation Plan"
}

/**
 * @description Controller to generate interview report based on user self description, resume and job description.
 */
async function generateInterViewReportController(req, res) {
    try {
        const { selfDescription, jobDescription } = req.body

        if (!jobDescription) {
            return res.status(400).json({
                message: "Job description is required."
            })
        }

        if (!req.file && (!selfDescription || !selfDescription.trim())) {
            return res.status(400).json({
                message: "Please provide either a resume PDF file or a self description."
            })
        }

        let extractedResumeText = ""
        if (req.file && req.file.buffer) {
            let pdfParser
            try {
                pdfParser = new PDFParse({ data: req.file.buffer })
                const parsed = await pdfParser.getText()
                extractedResumeText = parsed.text || ""
            } catch (err) {
                console.error("PDF Parsing error:", err)
                extractedResumeText = ""
            } finally {
                if (pdfParser) {
                    await pdfParser.destroy()
                }
            }
        }

        const interViewReportByAi = await generateInterviewReport({
            resume: extractedResumeText,
            selfDescription: selfDescription || "",
            jobDescription
        })

        const interviewReport = await interviewReportModel.create({
            user: req.user.id,
            resume: extractedResumeText,
            selfDescription: selfDescription || "",
            jobDescription,
            ...interViewReportByAi,
            title: getReportTitle(jobDescription, interViewReportByAi.title)
        })

        res.status(201).json({
            message: "Interview report generated successfully.",
            interviewReport
        })
    } catch (error) {
        console.error("Error in generateInterViewReportController:", error)
        res.status(500).json({
            message: error.message || "Failed to generate interview report."
        })
    }
}

/**
 * @description Controller to get interview report by interviewId.
 */
async function getInterviewReportByIdController(req, res) {
    try {
        const { interviewId } = req.params

        const interviewReport = await interviewReportModel.findOne({ _id: interviewId, user: req.user.id })

        if (!interviewReport) {
            return res.status(404).json({
                message: "Interview report not found."
            })
        }

        res.status(200).json({
            message: "Interview report fetched successfully.",
            interviewReport
        })
    } catch (error) {
        console.error("Error in getInterviewReportByIdController:", error)
        res.status(500).json({
            message: error.message || "Failed to fetch interview report."
        })
    }
}

/**
 * @description Controller to get all interview reports of logged in user.
 */
async function getAllInterviewReportsController(req, res) {
    try {
        const interviewReports = await interviewReportModel.find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan")

        res.status(200).json({
            message: "Interview reports fetched successfully.",
            interviewReports
        })
    } catch (error) {
        console.error("Error in getAllInterviewReportsController:", error)
        res.status(500).json({
            message: error.message || "Failed to fetch interview reports."
        })
    }
}

/**
 * @description Controller to generate resume PDF based on user self description, resume and job description.
 */
async function generateResumePdfController(req, res) {
    try {
        const { interviewReportId } = req.params

        const interviewReport = await interviewReportModel.findById(interviewReportId)

        if (!interviewReport || interviewReport.user.toString() !== req.user.id.toString()) {
            return res.status(404).json({
                message: "Interview report not found."
            })
        }

        const { resume, jobDescription, selfDescription } = interviewReport

        const pdfBuffer = await generateResumePdf({ resume, jobDescription, selfDescription })

        res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`
        })

        res.send(pdfBuffer)
    } catch (error) {
        console.error("Error in generateResumePdfController:", error)
        res.status(500).json({
            message: error.message || "Failed to generate resume PDF."
        })
    }
}

module.exports = {
    generateInterViewReportController,
    getInterviewReportByIdController,
    getAllInterviewReportsController,
    generateResumePdfController
}
