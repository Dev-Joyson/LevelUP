"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "react-toastify";

interface Company {
  _id: string;
  companyName: string;
  verified: boolean;
  internships: string[];
  appliedStudents: number;
  userId: {
    _id: string;
    email: string;
  };
  industry?: string;
  location?: string;
  description: string;
  website?: string;
  foundedYear?: string;
  employees?: string;
  createdAt: string;
  pdfUrl?: string;
  pdfPublicId?: string;
}

type StatusFilter = "all" | "pending";

interface AdminContextType {
  companies: Company[];
  loading: boolean;
  error: string | null;
  statusFilter: StatusFilter;
  searchTerm: string;
  selectedCompany: Company | null;
  approveDialogOpen: boolean;
  companyToApprove: Company | null;
  setStatusFilter: (filter: StatusFilter) => void;
  setSearchTerm: (term: string) => void;
  setSelectedCompany: (company: Company | null) => void;
  setApproveDialogOpen: (open: boolean) => void;
  setCompanyToApprove: (company: Company | null) => void;
  fetchCompanies: () => Promise<void>;
  approveCompany: (companyId: string) => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [approveDialogOpen, setApproveDialogOpen] = useState<boolean>(false);
  const [companyToApprove, setCompanyToApprove] = useState<Company | null>(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

  useEffect(() => {
    fetchCompanies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const endpoint = statusFilter === 'all'
        ? `${API_BASE_URL}/api/admin/companies`
        : `${API_BASE_URL}/api/admin/companies/unverified`;
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch companies');
      }
      const data = await response.json();
      setCompanies(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch companies');
      toast.error(err.message || 'Failed to fetch companies');
    } finally {
      setLoading(false);
    }
  };

  const approveCompany = async (companyId: string) => {
    try {
      setLoading(true);
      setError(null);
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const response = await fetch(`${API_BASE_URL}/api/admin/companies/${companyId}/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to approve company');
      }
      toast.success('Company approved successfully');
      await fetchCompanies();
    } catch (err: any) {
      setError(err.message || 'Failed to approve company');
      toast.error(err.message || 'Failed to approve company');
    } finally {
      setApproveDialogOpen(false);
      setCompanyToApprove(null);
      setLoading(false);
    }
  };

  return (
    <AdminContext.Provider
      value={{
        companies,
        loading,
        error,
        statusFilter,
        searchTerm,
        selectedCompany,
        approveDialogOpen,
        companyToApprove,
        setStatusFilter,
        setSearchTerm,
        setSelectedCompany,
        setApproveDialogOpen,
        setCompanyToApprove,
        fetchCompanies,
        approveCompany,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdminContext = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error("useAdminContext must be used within an AdminProvider");
  }
  return context;
}; 