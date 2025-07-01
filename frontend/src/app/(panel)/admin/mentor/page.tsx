"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/inputAdmin"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, UserPlus, Eye } from "lucide-react"
import { MentorDetailsModal } from "@/components/AdminComponents/mentor-details-modal"
import { InviteMentorModal } from "@/components/AdminComponents/invite-mentor-modal"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { notifySuccess, notifyError } from "@/lib/notify"

type StatusFilter = "all" | "active" | "pending"

export default function MentorsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [mentors, setMentors] = useState<any[]>([])
  const [selectedMentor, setSelectedMentor] = useState<any | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [mentorToDelete, setMentorToDelete] = useState<any | null>(null)
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [mentorToApprove, setMentorToApprove] = useState<any | null>(null);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [mentorToReject, setMentorToReject] = useState<any | null>(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';


  // Fetch mentors from backend
  useEffect(() => {
    const fetchMentors = async () => {
      setLoading(true)
      const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null
      let url = `${API_BASE_URL}/api/admin/mentors`
      if (statusFilter === "pending") url = `${API_BASE_URL}/api/admin/mentors/unverified`
      try {
        const res = await fetch(url, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        })
        const data = await res.json()
        // Map backend mentor data to frontend shape
        const mentorsArray = Array.isArray(data.mentors) ? data.mentors : data;
        const mappedMentors = mentorsArray.map((mentor: any) => ({
          id: mentor._id,
          name: mentor.userId?.name || mentor.userId?.email || "N/A",
          email: mentor.userId?.email || "N/A",
          company: mentor.company || "N/A",
          status: mentor.userId?.isVerified ? "Active" : "Pending",
          isVerified: mentor.userId?.isVerified,
          rejected: mentor.rejected,
          lastActive: mentor.lastActive || "",
          mentoringSessions: mentor.sessions?.length || 0,
          expertise: Array.isArray(mentor.expertise) ? mentor.expertise.join(', ') : mentor.expertise || "",
          experience: mentor.experience || "",
          bio: mentor.bio || "",
          phone: mentor.phone || "",
          location: mentor.location || "",
          joinedDate: mentor.createdAt ? new Date(mentor.createdAt).toLocaleDateString() : "",
        }));
        setMentors(mappedMentors)
      } catch (err) {
        setMentors([])
      } finally {
        setLoading(false)
      }
    }
    fetchMentors()
  }, [statusFilter, API_BASE_URL])

  const filteredMentors = mentors.filter((mentor) => {
    const matchesSearch =
      mentor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.company?.toLowerCase().includes(searchTerm.toLowerCase())
    if (statusFilter === "all") return matchesSearch
    if (statusFilter === "active") return matchesSearch && mentor.isVerified
    if (statusFilter === "pending") return matchesSearch && !mentor.isVerified
    return matchesSearch
  })

  const getStatusBadge = (mentor: any) => {
    if (mentor.isVerified) {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
    } else if (mentor.rejected) {
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Rejected</Badge>
    } else {
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>
    }
  }

  const handleViewMentor = (mentor: any) => {
    setSelectedMentor(mentor)
    setIsDetailsModalOpen(true)
  }

  // Approve mentor with confirmation
  const handleApproveMentor = (mentorId: string) => {
    setMentorToApprove(mentorId);
    setIsApproveModalOpen(true);
  };

  const confirmApproveMentor = async () => {
    if (!mentorToApprove) return;
    const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/mentors/${mentorToApprove}/verify`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.ok) {
        notifySuccess("Mentor approved successfully.");
        setMentors((prev) => prev.map(m => m.id === mentorToApprove ? { ...m, isVerified: true, status: "Active" } : m));
      } else {
        notifyError("Failed to approve mentor.");
      }
    } catch (err) {
      notifyError("Failed to approve mentor.");
    } finally {
      setIsApproveModalOpen(false);
      setMentorToApprove(null);
      setIsDetailsModalOpen(false);
    }
  };

  // Reject mentor with confirmation
  const handleRejectMentor = (mentorId: string) => {
    setMentorToReject(mentorId);
    setIsRejectModalOpen(true);
  };

  const confirmRejectMentor = async () => {
    if (!mentorToReject) return;
    const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/mentors/${mentorToReject}/reject`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.ok) {
        notifySuccess("Mentor rejected successfully.");
        setMentors((prev) => prev.filter(m => m.id !== mentorToReject));
      } else {
        notifyError("Failed to reject mentor.");
      }
    } catch (err) {
      notifyError("Failed to reject mentor.");
    } finally {
      setIsRejectModalOpen(false);
      setMentorToReject(null);
      setIsDetailsModalOpen(false);
    }
  };

  // Delete mentor with toast
  const handleDeleteMentor = async (mentorId: string) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/mentors/${mentorId}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.ok) {
        notifySuccess("Mentor deleted successfully.");
        setMentors((prev) => prev.filter(m => m.id !== mentorId));
      } else {
        notifyError("Failed to delete mentor.");
      }
    } catch (err) {
      notifyError("Failed to delete mentor.");
    } finally {
      setIsDeleteModalOpen(false);
      setMentorToDelete(null);
      setIsDetailsModalOpen(false);
    }
  }

  const getFilterButtonClass = (filter: StatusFilter) => {
    return statusFilter === filter
      ? "bg-blue-50 text-blue-700 border-b-2 border-blue-700"
      : "text-gray-600 hover:text-gray-900"
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Mentors</h1>
        <Button onClick={() => setIsInviteModalOpen(true)} className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Invite mentor
        </Button>
      </div>

      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search mentors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-50 border-gray-200"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setStatusFilter("all")}
            className={`cursor-pointer px-4 py-1 rounded font-medium border transition-colors duration-150 ${statusFilter === "all" ? "bg-primary text-white" : "bg-white text-gray-700 border-gray-300 "}`}
          >
            All
          </button>
          <button
            onClick={() => setStatusFilter("active")}
            className={`cursor-pointer px-4 py-1 rounded font-medium border transition-colors duration-150 ${statusFilter === "active" ? "bg-primary text-white" : "bg-white text-gray-700 border-gray-300 "}`}
          >
            Active
          </button>
          <button
            onClick={() => setStatusFilter("pending")}
            className={`cursor-pointer px-4 py-1 rounded font-medium border transition-colors duration-150 ${statusFilter === "pending" ? "bg-primary text-white " : "bg-white text-gray-700 border-gray-300 "}`}
          >
            Pending
          </button>
        </div>
      </div>

      {/* Mentors Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-b">
                <TableHead className="font-medium text-gray-600 py-4">Name</TableHead>
                <TableHead className="font-medium text-gray-600 py-4">Email</TableHead>
                <TableHead className="font-medium text-gray-600 py-4">Company</TableHead>
                <TableHead className="font-medium text-gray-600 py-4">Status</TableHead>
                <TableHead className="font-medium text-gray-600 py-4">Last active</TableHead>
                <TableHead className="font-medium text-gray-600 py-4">Mentoring sessions</TableHead>
                <TableHead className="font-medium text-gray-600 py-4">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMentors.map((mentor) => (
                <TableRow
                  key={mentor.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <TableCell className="py-4 font-medium">{mentor.name}</TableCell>
                  <TableCell className="py-4 text-blue-600">{mentor.email}</TableCell>
                  <TableCell className="py-4 text-gray-600">{mentor.company}</TableCell>
                  <TableCell className="py-4">{getStatusBadge(mentor)}</TableCell>
                  <TableCell className="py-4 text-gray-600">{mentor.lastActive}</TableCell>
                  <TableCell className="py-4 text-gray-600">{mentor.mentoringSessions}</TableCell>
                  <TableCell className="py-4 flex gap-2">
                    <button
                      className="cursor-pointer text-gray-700 px-2 py-1 text-sm hover:bg-gray-50 focus:outline-none"
                      onClick={() => handleViewMentor(mentor)}
                      title="View"
                    >
                      <Eye className="h-3 w-3" />
                    </button>
                    {!mentor.isVerified && !mentor.rejected && (
                      <>
                        <button
                          className="cursor-pointer border border-green-600 rounded bg-white text-green-600 px-3 py-1 text-sm focus:outline-none"
                          onClick={() => handleApproveMentor(mentor.id)}
                        >
                          Approve
                        </button>
                        <button
                          className="cursor-pointer border border-gray-300 rounded bg-white text-gray-700 px-3 py-1 text-sm hover:bg-gray-100 focus:outline-none"
                          onClick={() => handleRejectMentor(mentor.id)}
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <MentorDetailsModal
        mentor={selectedMentor}
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        onApproveMentor={handleApproveMentor}
        onRejectMentor={handleRejectMentor}
        onDeleteMentor={(mentorId) => {
          setMentorToDelete(mentorId)
          setIsDeleteModalOpen(true)
        }}
      />

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Mentor</DialogTitle>
          </DialogHeader>
          <div className="py-4">Are you sure you want to delete this mentor? This action cannot be undone.</div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => handleDeleteMentor(mentorToDelete)}>Delete</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Approve Confirmation Modal */}
      <Dialog open={isApproveModalOpen} onOpenChange={setIsApproveModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Approve Mentor</DialogTitle>
          </DialogHeader>
          <div className="py-4">Are you sure you want to approve this mentor?</div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsApproveModalOpen(false)}>Cancel</Button>
            <Button variant="default" onClick={confirmApproveMentor}>Approve</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reject Confirmation Modal */}
      <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Mentor</DialogTitle>
          </DialogHeader>
          <div className="py-4">Are you sure you want to reject this mentor? This action cannot be undone.</div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsRejectModalOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmRejectMentor}>Reject</Button>
          </div>
        </DialogContent>
      </Dialog>

      <InviteMentorModal isOpen={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} />
    </div>
  )
}
