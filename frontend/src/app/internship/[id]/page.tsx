import { notFound } from "next/navigation";
import { Bookmark, Briefcase, Check, X, MapPin, Clock, DollarSign, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { InternshipDetail } from "@/types/job";
import ApplyButtonWrapper from "./ApplyButtonWrapper";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Function to fetch internship data from backend
async function getInternshipData(id: string): Promise<InternshipDetail | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/student/internships/${id}`, {
      cache: 'no-store', // Ensure fresh data on each request
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Failed to fetch internship data');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching internship:', error);
    return null;
  }
}

// Function to calculate days since posting
function calculatePostedDays(createdAt: string): number {
  const createdDate = new Date(createdAt);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - createdDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

// Function to generate mock qualifications based on criteria skills
function generateQualifications(skills: string[]): { skill: string; match: boolean }[] {
  return skills.map(skill => ({
    skill,
    match: Math.random() > 0.3 // Random matching for demo purposes
  }));
}

// **Changed here: make the function async, type params as Promise, and await it**
export default async function InternshipDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params; // Await params to get actual id
  const job = await getInternshipData(id);

  if (!job) {
    notFound();
  }

  // Generate qualifications from criteria skills
  const qualifications = job.criteria?.skills 
    ? generateQualifications(job.criteria.skills) 
    : [];

  // Get company name from either company or companyId
  const companyName = job.company?.name || job.companyId?.name || 'Unknown Company';
  
  // Calculate posted days
  const postedDays = calculatePostedDays(job.createdAt);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="text-gray-600">
            <Briefcase className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">{companyName}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Bookmark className="h-7 w-7" />
          </Button>
          {/* Use the ApplyButton component */}
          <div className="client-only">
            <ApplyButtonWrapper internshipId={job._id} title={job.title} companyName={companyName} />
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-semibold mt-2">{job.title}</h2>
      
      <div className="flex items-center gap-4 mt-2 text-gray-500">
        <div className="flex items-center gap-1">
          <MapPin className="h-4 w-4" />
          <span className="text-sm">{job.location}</span>
        </div>
        
        <div className="flex items-center gap-1">
          <DollarSign className="h-4 w-4" />
          <span className="text-sm">
            {job.salary.display || `LKR ${job.salary.min} - ${job.salary.max}`}
          </span>
        </div>
        
        {job.duration && (
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span className="text-sm">{job.duration}</span>
          </div>
        )}
        
        <div className="flex items-center gap-1">
          <Building className="h-4 w-4" />
          <span className="text-sm capitalize">{job.workMode}</span>
        </div>
      </div>

      {/* Work Mode & Domain */}
      <div className="flex gap-2 mt-3">
        {job.domain && (
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
            {job.domain}
          </span>
        )}
        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm capitalize">
          {job.workMode}
        </span>
        {job.positions && job.positions > 1 && (
          <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
            {job.positions} positions
          </span>
        )}
      </div>

      {/* Qualifications Section */}
      {qualifications.length > 0 && (
        <div className="mt-4 border-t pt-6">
          <h3 className="text-xl font-semibold mb-4">Your qualifications for this job</h3>
          <div className="border rounded-lg p-6 bg-white">
            <p className="mb-4 font-medium">Do you have any of these qualifications?</p>
            <div className="space-y-3">
              {qualifications.map((qual: { skill: string; match: boolean }, index: number) => (
                <div key={index} className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      qual.match ? "bg-gray-200 text-black" : "bg-gray-200 text-black"
                    }`}
                  >
                    {qual.match ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                  </div>
                  <span>{qual.skill}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 border-t pt-6">
        <h3 className="text-xl font-bold mb-4">About this JOB</h3>
        <p className="text-gray-700 leading-relaxed">{job.description}</p>
      </div>

      {/* About the role section */}
      {job.aboutRole && (
        <div className="mt-8 border-t pt-6">
          <h3 className="text-xl font-bold mb-4">About the role</h3>
          <div className="text-gray-700 leading-relaxed whitespace-pre-line">{job.aboutRole}</div>
        </div>
      )}

      {/* Requirements section */}
      {job.requirements && job.requirements.length > 0 && (
        <div className="mt-8 border-t pt-6">
          <h3 className="text-xl font-bold mb-4">You have</h3>
          <ul className="list-disc pl-5 space-y-2 text-gray-700">
            {job.requirements.map((requirement: string, index: number) => (
              <li key={index}>{requirement}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Benefits section */}
      {job.benefits && job.benefits.length > 0 && (
        <div className="mt-8 border-t pt-6">
          <h3 className="text-xl font-bold mb-4">What you'll learn from us</h3>
          <ul className="list-disc pl-5 space-y-2 text-gray-700">
            {job.benefits.map((benefit: string, index: number) => (
              <li key={index}>{benefit}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Preferred Skills */}
      {job.preferredSkills && job.preferredSkills.length > 0 && (
        <div className="mt-8 border-t pt-6">
          <h3 className="text-xl font-bold mb-4">Preferred Skills</h3>
          <div className="flex flex-wrap gap-2">
            {job.preferredSkills.map((skill: string, index: number) => (
              <span key={index} className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Application Info */}
      <div className="mt-8 border-t pt-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2 text-blue-800">Application Information</h3>
          <div className="text-sm text-blue-700 space-y-1">
            <p>Posted: {postedDays} days ago</p>
            {job.applicationDeadline && (
              <p>Application Deadline: {new Date(job.applicationDeadline).toLocaleDateString()}</p>
            )}
            {job.minimumGPA && job.minimumGPA > 0 && (
              <p>Minimum GPA Required: {job.minimumGPA}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
