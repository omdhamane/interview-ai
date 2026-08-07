import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:3000",
    withCredentials: true,
})


/**
 * @description Service to generate interview report based on user self description, resume and job description.
 */
export const generateInterviewReport = async ({ jobDescription, selfDescription, resumeFile }) => {
    try {
        const formData = new FormData()
        formData.append("jobDescription", jobDescription || "")
        formData.append("selfDescription", selfDescription || "")
        if (resumeFile) {
            formData.append("resume", resumeFile)
        }

        const response = await api.post("/api/interview/", formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        })

        return response.data
    } catch (err) {
        const message = err.response?.data?.message || err.message || "Failed to generate interview report"
        throw new Error(message, { cause: err })
    }
}

export const getInterviewReportById = async (interviewId) => {
    try {
        const response = await api.get(`/api/interview/report/${interviewId}`)
        return response.data
    } catch (err) {
        const message = err.response?.data?.message || err.message || "Failed to fetch interview report"
        throw new Error(message, { cause: err })
    }
}

export const getAllInterviewReports = async () => {
    try {
        const response = await api.get("/api/interview/")
        return response.data
    } catch (err) {
        const message = err.response?.data?.message || err.message || "Failed to fetch interview reports"
        throw new Error(message, { cause: err })
    }
}

export const generateResumePdf = async ({ interviewReportId }) => {
    try {
        const response = await api.post(`/api/interview/resume/pdf/${interviewReportId}`, null, {
            responseType: "blob"
        })
        return response.data
    } catch (err) {
        const message = err.response?.data?.message || err.message || "Failed to generate resume PDF"
        throw new Error(message, { cause: err })
    }
}
