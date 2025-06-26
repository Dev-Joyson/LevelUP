import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "react-toastify";

interface StudentContextType {
  resumeUrl: string | null;
  uploading: boolean;
  uploadError: string;
  fetchResume: () => Promise<void>;
  uploadResume: (file: File) => Promise<void>;
  setUploadError: (err: string) => void;
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

export const StudentProvider = ({ children }: { children: ReactNode }) => {
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

  const fetchResume = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
      const res = await fetch(`${API_BASE_URL}/api/student/profile`, {
        method: "GET",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setResumeUrl(data.resumeUrl || null);
      }
    } catch (err) {
      // ignore
    }
  };

  const uploadResume = async (file: File) => {
    if (file.type !== "application/pdf") {
      setUploadError("Only PDF files are allowed");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("File size must be less than 5MB");
      return;
    }
    setUploadError("");
    setUploading(true);
    const formData = new FormData();
    formData.append("resume", file);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
      const res = await fetch(`${API_BASE_URL}/api/student/resume`, {
        method: "POST",
        body: formData,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (res.ok) {
        setResumeUrl(data.resumeUrl);
        setUploadError("");
        toast.success("Resume uploaded successfully");
      } else {
        setUploadError(data.message || "Failed to upload resume");
        toast.error(data.message || "Failed to upload resume");
      }
    } catch (err) {
      setUploadError("Server error. Please try again later.");
      toast.error("Server error. Please try again later.");
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    fetchResume();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <StudentContext.Provider
      value={{
        resumeUrl,
        uploading,
        uploadError,
        fetchResume,
        uploadResume,
        setUploadError,
      }}
    >
      {children}
    </StudentContext.Provider>
  );
};

export const useStudentContext = () => {
  const context = useContext(StudentContext);
  if (context === undefined) {
    throw new Error("useStudentContext must be used within a StudentProvider");
  }
  return context;
}; 