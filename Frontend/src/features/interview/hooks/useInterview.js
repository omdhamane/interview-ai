import { getAllInterviewReports, generateInterviewReport, getInterviewReportById, generateResumePdf } from "../services/interview.api"
import { useCallback, useContext, useEffect } from "react"
import { InterviewContext } from "../interview-context"
import { useParams } from "react-router"


export const useInterview = () => {

    const context = useContext(InterviewContext)
    const { interviewId } = useParams()

    if (!context) {
        throw new Error("useInterview must be used within an InterviewProvider")
    }

    const { loading, setLoading, report, setReport, reports, setReports, error, setError } = context

    const generateReport = async ({ jobDescription, selfDescription, resumeFile }) => {
        setLoading(true)
        setError(null)
        try {
            const response = await generateInterviewReport({ jobDescription, selfDescription, resumeFile })
            if (response && response.interviewReport) {
                setReport(response.interviewReport)
                return response.interviewReport
            }
            return null
        } catch (err) {
            setError(err.message)
            return null
        } finally {
            setLoading(false)
        }
    }

    const getReportById = useCallback(async (id) => {
        const targetId = id || interviewId
        if (!targetId) return null

        setLoading(true)
        setError(null)
        try {
            const response = await getInterviewReportById(targetId)
            if (response && response.interviewReport) {
                setReport(response.interviewReport)
                return response.interviewReport
            }
            return null
        } catch (err) {
            setError(err.message)
            return null
        } finally {
            setLoading(false)
        }
    }, [interviewId, setError, setLoading, setReport])

    const getReports = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const response = await getAllInterviewReports()
            if (response && response.interviewReports) {
                setReports(response.interviewReports)
                return response.interviewReports
            }
            return []
        } catch (err) {
            setError(err.message)
            return []
        } finally {
            setLoading(false)
        }
    }, [setError, setLoading, setReports])

    const getResumePdf = async (interviewReportId) => {
        setLoading(true)
        setError(null)
        try {
            const response = await generateResumePdf({ interviewReportId })
            const url = window.URL.createObjectURL(new Blob([ response ], { type: "application/pdf" }))
            const link = document.createElement("a")
            link.href = url
            link.setAttribute("download", `resume_${interviewReportId}.pdf`)
            document.body.appendChild(link)
            link.click()
            link.remove()
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (interviewId) {
            getReportById(interviewId)
        } else {
            getReports()
        }
    }, [getReportById, getReports, interviewId])

    return { loading, error, setError, report, reports, generateReport, getReportById, getReports, getResumePdf }

}
