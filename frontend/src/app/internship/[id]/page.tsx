import { notFound } from "next/navigation";
import { Bookmark, Briefcase, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Job } from "@/components/InterviewComponents/InternshipSidebar";

// Sample job data - in a real app, this would come from an API or database
const jobListings: Record<
  string,
  Job & {
    description?: string;
    aboutRole?: string;
    requirements?: string[];
    benefits?: string;
    qualifications?: { skill: string; match: boolean }[];
    jobType?: string;
  }
> = {
  "virtusa-mlops": {
    id: "virtusa-mlops",
    company: {
      name: "virtusa",
    },
    title: "MLOps Engineer",
    location: "Colombo, Srilanka",
    salary: "30,000 LKR - 50,0000 LKR",
    description:
      "Built for consumers and companies, alike. In a world driven by data, we believe consumers and businesses can coexist. Our founders had a vision to empower consumers to leverage their greatest asset—their data—in exchange for modern financial services. Built with this vision in mind, our platform allows consumers to access savings tools, earned wages and rewards without cost or hidden fees. In exchange, they give permission to use their real-time data for research, insights and targeted advertising.",
    qualifications: [
      { skill: "Management", match: true },
      { skill: "Leadership", match: true },
      { skill: "IT", match: true },
    ],
    aboutRole:
      "Built for consumers and companies, alike. In a world driven by data, we believe consumers and businesses can coexist. Our founders had a vision to empower consumers to leverage their greatest asset—their data—in exchange for modern financial services. Built with this vision in mind, our platform allows consumers to access savings tools, earned wages and rewards without cost or hidden fees. In exchange, they give permission to use their real-time data for research, insights and targeted advertising.\n\nAt Attain, your contribution will help us build a more equitable and efficient data sharing ecosystem—whether helping consumers access modern financial services directly or helping businesses leverage data to make better decisions directly with hands-on leaders and mission-driven individuals.\n\nAbout the role\nWe are looking for a machine learning (ML) and data science-based MLOps Engineer to join our team. To meet the growing needs of our business, we are searching for an experienced Machine Learning Operations Engineer to support the development of a machine learning platform that will enable our data scientists across the company to easily build and deploy machine learning solutions and data science applications components. The person will be responsible for building and maintaining machine learning models and algorithms into AI products for our consumers.",
    requirements: [
      "2+ years of hands-on experience building and deploying machine learning models",
      "Experience in building and deploying offline and online machine learning services in production",
      "Good understanding of machine learning software and infrastructure development",
      "Proficiency in Python",
    ],
    benefits:
      "At Attain, we are passionate about finding people to continuously help us grow our organization. We encourage you to apply even if you don't meet all the requirements. If you're excited about this role but don't see something that immediately fits, we will keep you in mind for future opportunities.",
  },
  "softsora-it": {
    id: "softsora-it",
    company: {
      name: "Softsora",
    },
    title: "IT Engineer",
    location: "Colombo, Srilanka",
    salary: "30,000 LKR - 50,0000 LKR",
    description: "Job description for IT Engineer position at Softsora.",
    qualifications: [
      { skill: "Networking", match: true },
      { skill: "System Administration", match: false },
      { skill: "Cloud Computing", match: true },
    ],
  },
  "coginitix-python": {
    id: "coginitix-python",
    company: {
      name: "Coginitix",
    },
    title: "Python Developer",
    location: "Colombo, Srilanka",
    salary: "30,000 LKR - 50,0000 LKR",
    description: "Job description for Python Developer position at Coginitix.",
    qualifications: [
      { skill: "Python", match: true },
      { skill: "Django", match: false },
      { skill: "Flask", match: true },
    ],
  },
  "rootcode-ai": {
    id: "rootcode-ai",
    company: {
      name: "rootCode",
    },
    title: "AI/ML Engineer",
    location: "Colombo, Srilanka",
    salary: "30,000 LKR - 50,0000 LKR",
    description: "Job description for AI/ML Engineer position at rootCode.",
    qualifications: [
      { skill: "Machine Learning", match: true },
      { skill: "TensorFlow", match: false },
      { skill: "PyTorch", match: true },
    ],
  },
};

// **Changed here: make the function async, type params as Promise, and await it**
export default async function InternshipDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params; // Await params to get actual id
  const job = jobListings[id];

  if (!job) {
    notFound();
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="text-gray-600">
            <Briefcase className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">{job.company.name}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Bookmark className="h-7 w-7" />
          </Button>
          <Button className="bg-primary text-white  hover:bg-white hover:border-1 hover:border-primary hover:text-primary rounded-md px-9">
            Apply
          </Button>
        </div>
      </div>

      <h2 className="text-2xl font-semibold mt-2">{job.title}</h2>
      <div className="flex items-center gap-2 mt-1 text-gray-500">
        <span className="text-sm">{job.location}</span>
        <span className="h-1.5 w-1.5 rounded-full bg-gray-500"></span>
        <span className="text-sm">{job.salary}</span>
      </div>

      <div className="mt-4 border-t pt-6">
        <h3 className="text-xl font-semibold mb-4">Your qualifications for this job</h3>
        <div className="border rounded-lg p-6 bg-white">
          <p className="mb-4 font-medium">Do you have any of these qualifications?</p>
          <div className="space-y-3">
            {job.qualifications?.map((qual, index) => (
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
      {job.requirements && (
        <div className="mt-8 border-t pt-6">
          <h3 className="text-xl font-bold mb-4">You have</h3>
          <ul className="list-disc pl-5 space-y-2 text-gray-700">
            {job.requirements.map((requirement, index) => (
              <li key={index}>{requirement}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Benefits section */}
      {job.benefits && (
        <div className="mt-8 border-t pt-6">
          <h3 className="text-xl font-bold mb-4">What you'll learn from you</h3>
          <p className="text-gray-700 leading-relaxed">{job.benefits}</p>
        </div>
      )}
    </div>
  );
}
