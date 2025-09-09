import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "react-toastify";
import { useAuth } from "./AuthContext";

interface StudentProfile {
  firstname: string;
  lastname: string;
  email: string;
  phoneNumber: string;
  university?: string;
  graduationYear?: string;
  profileImageUrl?: string;
}

interface StudentContextType {
  resumeUrl: string | null;
  uploading: boolean;
  uploadError: string;
  profileData: StudentProfile | null;
  profileLoading: boolean;
  fetchResume: () => Promise<void>;
  uploadResume: (file: File) => Promise<void>;
  fetchProfile: () => Promise<void>;
  updateProfileData: (data: Partial<StudentProfile>) => void;
  setUploadError: (err: string) => void;
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

export const StudentProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [profileData, setProfileData] = useState<StudentProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

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

  const fetchProfile = async () => {
    try {
      setProfileLoading(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
      if (!token) {
        setProfileLoading(false);
        return;
      }
      
      const res = await fetch(`${API_BASE_URL}/api/student/profile`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.ok) {
        const data = await res.json();
        setProfileData({
          firstname: data.firstname || "",
          lastname: data.lastname || "",
          email: data.email || "",
          phoneNumber: data.phoneNumber || "",
          university: data.university || "",
          graduationYear: data.graduationYear || "",
          profileImageUrl: data.profileImageUrl || "",
        });
        // Also update resume URL if available
        setResumeUrl(data.resumeUrl || null);
      }
    } catch (err) {
      console.error("Error fetching student profile:", err);
    } finally {
      setProfileLoading(false);
    }
  };

  const updateProfileData = (data: Partial<StudentProfile>) => {
    setProfileData(prev => prev ? { ...prev, ...data } : null);
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
    // Only fetch profile data if user is a student
    if (user?.role === 'student') {
      fetchProfile(); // This will also fetch resume data
    } else {
      setProfileLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role]);

  return (
    <StudentContext.Provider
      value={{
        resumeUrl,
        uploading,
        uploadError,
        profileData,
        profileLoading,
        fetchResume,
        uploadResume,
        fetchProfile,
        updateProfileData,
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

// Safe hook that returns null data for non-students instead of throwing error
export const useStudentContextSafe = () => {
  try {
    const context = useStudentContext();
    return context;
  } catch {
    // Return safe defaults for non-student users or when context is unavailable
    return {
      resumeUrl: null,
      uploading: false,
      uploadError: "",
      profileData: null,
      profileLoading: false,
      fetchResume: async () => {},
      uploadResume: async () => {},
      fetchProfile: async () => {},
      updateProfileData: () => {},
      setUploadError: () => {},
    };
  }
}; 