"use client"

import type React from "react"
import { useState, useEffect } from "react"

interface MatchingCriteria {
  skills: number
  projects: number
  experience: number
  gpa: number
  certifications: number
}

interface Internship {
  _id: string
  title: string
  matchingCriteria: MatchingCriteria
  preferredSkills: string[]
  minimumGPA: number
}

interface MatchingCriteriaModalProps {
  isOpen: boolean
  onClose: () => void
  internship: Internship | null
  onUpdate: () => void
}

const MatchingCriteriaModal: React.FC<MatchingCriteriaModalProps> = ({ isOpen, onClose, internship, onUpdate }) => {
  const [criteria, setCriteria] = useState<MatchingCriteria>({
    skills: 50,
    projects: 20,
    experience: 15,
    gpa: 10,
    certifications: 5,
  })

  const [preferredSkills, setPreferredSkills] = useState<string[]>([])
  const [minimumGPA, setMinimumGPA] = useState<number>(0)
  const [newSkill, setNewSkill] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (internship) {
      setCriteria(internship.matchingCriteria)
      setPreferredSkills(internship.preferredSkills || [])
      setMinimumGPA(internship.minimumGPA || 0)
    }
  }, [internship])

  const getTotalPercentage = () => {
    return criteria.skills + criteria.projects + criteria.experience + criteria.gpa + criteria.certifications
  }

  const isValidCriteria = () => {
    const total = getTotalPercentage()
    return total === 100
  }

  const handleCriteriaChange = (field: keyof MatchingCriteria, value: number) => {
    setCriteria((prev) => ({
      ...prev,
      [field]: Math.max(0, Math.min(100, value)),
    }))
  }

  const handleAddSkill = () => {
    if (newSkill.trim() && !preferredSkills.includes(newSkill.trim())) {
      setPreferredSkills((prev) => [...prev, newSkill.trim()])
      setNewSkill("")
    }
  }

  const handleRemoveSkill = (skillToRemove: string) => {
    setPreferredSkills((prev) => prev.filter((skill) => skill !== skillToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!internship) return

    if (!isValidCriteria()) {
      setError("Matching criteria must sum to exactly 100%")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:5000/api/company/internships/${internship._id}/criteria`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          matchingCriteria: criteria,
          preferredSkills,
          minimumGPA,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update matching criteria")
      }

      onUpdate()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const getPercentageColor = (percentage: number) => {
    if (percentage === 0) return "text-gray-500"
    if (percentage < 10) return "text-red-600"
    if (percentage < 30) return "text-yellow-600"
    return "text-blue-600"
  }

  const getTotalColor = () => {
    const total = getTotalPercentage()
    if (total === 100) return "text-green-600 font-semibold"
    if (total > 100) return "text-red-600 font-semibold"
    return "text-orange-600 font-semibold"
  }

  if (!isOpen || !internship) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold">Edit Matching Criteria</h3>
              <p className="text-sm text-gray-600">{internship.title}</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Matching Criteria */}
            <div>
              <h4 className="font-medium mb-4">Matching Criteria Weights</h4>

              <div className="space-y-4">
                {/* Skills */}
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 w-24">Skills</label>
                  <div className="flex-1 mx-4">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={criteria.skills}
                      onChange={(e) => handleCriteriaChange("skills", Number.parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div className="w-16 text-right">
                    <span className={`text-sm font-medium ${getPercentageColor(criteria.skills)}`}>
                      {criteria.skills}%
                    </span>
                  </div>
                </div>

                {/* Projects */}
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 w-24">Projects</label>
                  <div className="flex-1 mx-4">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={criteria.projects}
                      onChange={(e) => handleCriteriaChange("projects", Number.parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div className="w-16 text-right">
                    <span className={`text-sm font-medium ${getPercentageColor(criteria.projects)}`}>
                      {criteria.projects}%
                    </span>
                  </div>
                </div>

                {/* Experience */}
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 w-24">Experience</label>
                  <div className="flex-1 mx-4">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={criteria.experience}
                      onChange={(e) => handleCriteriaChange("experience", Number.parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div className="w-16 text-right">
                    <span className={`text-sm font-medium ${getPercentageColor(criteria.experience)}`}>
                      {criteria.experience}%
                    </span>
                  </div>
                </div>

                {/* GPA */}
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 w-24">GPA</label>
                  <div className="flex-1 mx-4">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={criteria.gpa}
                      onChange={(e) => handleCriteriaChange("gpa", Number.parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div className="w-16 text-right">
                    <span className={`text-sm font-medium ${getPercentageColor(criteria.gpa)}`}>{criteria.gpa}%</span>
                  </div>
                </div>

                {/* Certifications */}
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 w-24">Certifications</label>
                  <div className="flex-1 mx-4">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={criteria.certifications}
                      onChange={(e) => handleCriteriaChange("certifications", Number.parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div className="w-16 text-right">
                    <span className={`text-sm font-medium ${getPercentageColor(criteria.certifications)}`}>
                      {criteria.certifications}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Total Percentage */}
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total:</span>
                  <span className={`text-lg ${getTotalColor()}`}>{getTotalPercentage()}%</span>
                </div>
                {!isValidCriteria() && (
                  <p className="text-xs text-red-600 mt-1">Total must equal 100% (currently {getTotalPercentage()}%)</p>
                )}
              </div>
            </div>

            {/* Minimum GPA */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Minimum GPA</label>
              <input
                type="number"
                min="0"
                max="4"
                step="0.1"
                value={minimumGPA}
                onChange={(e) => setMinimumGPA(Number.parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., 3.0"
              />
            </div>

            {/* Preferred Skills */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Skills</label>

              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSkill())}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add a skill..."
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {preferredSkills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !isValidCriteria()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Updating..." : "Update Criteria"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default MatchingCriteriaModal












// "use client"

// import React, { useState, useEffect } from 'react';

// interface MatchingCriteria {
//   skills: number;
//   projects: number;
//   experience: number;
//   gpa: number;
//   certifications: number;
// }

// interface Internship {
//   _id: string;
//   title: string;
//   matchingCriteria: MatchingCriteria;
//   preferredSkills: string[];
//   minimumGPA: number;
// }

// interface MatchingCriteriaModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   internship: Internship | null;
//   onUpdate: () => void;
// }

// const MatchingCriteriaModal: React.FC<MatchingCriteriaModalProps> = ({
//   isOpen,
//   onClose,
//   internship,
//   onUpdate
// }) => {
//   const [criteria, setCriteria] = useState<MatchingCriteria>({
//     skills: 50,
//     projects: 20,
//     experience: 15,
//     gpa: 10,
//     certifications: 5
//   });
//   const [preferredSkills, setPreferredSkills] = useState<string[]>([]);
//   const [minimumGPA, setMinimumGPA] = useState<number>(0);
//   const [newSkill, setNewSkill] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     if (internship) {
//       setCriteria(internship.matchingCriteria);
//       setPreferredSkills(internship.preferredSkills || []);
//       setMinimumGPA(internship.minimumGPA || 0);
//     }
//   }, [internship]);

//   const getTotalPercentage = () => {
//     return criteria.skills + criteria.projects + criteria.experience + criteria.gpa + criteria.certifications;
//   };

//   const isValidCriteria = () => {
//     const total = getTotalPercentage();
//     return total === 100;
//   };

//   const handleCriteriaChange = (field: keyof MatchingCriteria, value: number) => {
//     setCriteria(prev => ({
//       ...prev,
//       [field]: Math.max(0, Math.min(100, value))
//     }));
//   };

//   const handleAddSkill = () => {
//     if (newSkill.trim() && !preferredSkills.includes(newSkill.trim())) {
//       setPreferredSkills(prev => [...prev, newSkill.trim()]);
//       setNewSkill('');
//     }
//   };

//   const handleRemoveSkill = (skillToRemove: string) => {
//     setPreferredSkills(prev => prev.filter(skill => skill !== skillToRemove));
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     if (!internship) return;
    
//     if (!isValidCriteria()) {
//       setError('Matching criteria must sum to exactly 100%');
//       return;
//     }

//     setLoading(true);
//     setError(null);

//     try {
//       const token = localStorage.getItem('token');
//       const response = await fetch(
//         `http://localhost:5000/api/company/internships/${internship._id}/criteria`,
//         {
//           method: 'PUT',
//           headers: {
//             'Authorization': `Bearer ${token}`,
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify({
//             matchingCriteria: criteria,
//             preferredSkills,
//             minimumGPA
//           }),
//         }
//       );

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || 'Failed to update matching criteria');
//       }

//       onUpdate();
//       onClose();
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'An error occurred');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getPercentageColor = (percentage: number) => {
//     if (percentage === 0) return 'text-gray-500';
//     if (percentage < 10) return 'text-red-600';
//     if (percentage < 30) return 'text-yellow-600';
//     return 'text-blue-600';
//   };

//   const getTotalColor = () => {
//     const total = getTotalPercentage();
//     if (total === 100) return 'text-green-600 font-semibold';
//     if (total > 100) return 'text-red-600 font-semibold';
//     return 'text-orange-600 font-semibold';
//   };

//   if (!isOpen || !internship) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//       <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
//         <div className="p-6">
//           <div className="flex justify-between items-start mb-4">
//             <div>
//               <h3 className="text-lg font-semibold">Edit Matching Criteria</h3>
//               <p className="text-sm text-gray-600">{internship.title}</p>
//             </div>
//             <button
//               onClick={onClose}
//               className="text-gray-400 hover:text-gray-600"
//             >
//               ✕
//             </button>
//           </div>

//           <form onSubmit={handleSubmit} className="space-y-6">
//             {/* Matching Criteria */}
//             <div>
//               <h4 className="font-medium mb-4">Matching Criteria Weights</h4>
              
//               <div className="space-y-4">
//                 {/* Skills */}
//                 <div className="flex items-center justify-between">
//                   <label className="text-sm font-medium text-gray-700 w-24">
//                     Skills
//                   </label>
//                   <div className="flex-1 mx-4">
//                     <input
//                       type="range"
//                       min="0"
//                       max="100"
//                       value={criteria.skills}
//                       onChange={(e) => handleCriteriaChange('skills', parseInt(e.target.value))}
//                       className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
//                     />
//                   </div>
//                   <div className="w-16 text-right">
//                     <span className={`text-sm font-medium ${getPercentageColor(criteria.skills)}`}>
//                       {criteria.skills}%
//                     </span>
//                   </div>
//                 </div>

//                 {/* Projects */}
//                 <div className="flex items-center justify-between">
//                   <label className="text-sm font-medium text-gray-700 w-24">
//                     Projects
//                   </label>
//                   <div className="flex-1 mx-4">
//                     <input
//                       type="range"
//                       min="0"
//                       max="100"
//                       value={criteria.projects}
//                       onChange={(e) => handleCriteriaChange('projects', parseInt(e.target.value))}
//                       className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
//                     />
//                   </div>
//                   <div className="w-16 text-right">
//                     <span className={`text-sm font-medium ${getPercentageColor(criteria.projects)}`}>
//                       {criteria.projects}%
//                     </span>
//                   </div>
//                 </div>

//                 {/* Experience */}
//                 <div className="flex items-center justify-between">
//                   <label className="text-sm font-medium text-gray-700 w-24">
//                     Experience
//                   </label>
//                   <div className="flex-1 mx-4">
//                     <input
//                       type="range"
//                       min="0"
//                       max="100"
//                       value={criteria.experience}
//                       onChange={(e) => handleCriteriaChange('experience', parseInt(e.target.value))}
//                       className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
//                     />
//                   </div>
//                   <div className="w-16 text-right">
//                     <span className={`text-sm font-medium ${getPercentageColor(criteria.experience)}`}>
//                       {criteria.experience}%
//                     </span>
//                   </div>
//                 </div>

//                 {/* GPA */}
//                 <div className="flex items-center justify-between">
//                   <label className="text-sm font-medium text-gray-700 w-24">
//                     GPA
//                   </label>
//                   <div className="flex-1 mx-4">
//                     <input
//                       type="range"
//                       min="0"
//                       max="100"
//                       value={criteria.gpa}
//                       onChange={(e) => handleCriteriaChange('gpa', parseInt(e.target.value))}
//                       className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
//                     />
//                   </div>
//                   <div className="w-16 text-right">
//                     <span className={`text-sm font-medium ${getPercentageColor(criteria.gpa)}`}>
//                       {criteria.gpa}%
//                     </span>
//                   </div>
//                 </div>

//                 {/* Certifications */}
//                 <div className="flex items-center justify-between">
//                   <label className="text-sm font-medium text-gray-700 w-24">
//                     Certifications
//                   </label>
//                   <div className="flex-1 mx-4">
//                     <input
//                       type="range"
//                       min="0"
//                       max="100"
//                       value={criteria.certifications}
//                       onChange={(e) => handleCriteriaChange('certifications', parseInt(e.target.value))}
//                       className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
//                     />
//                   </div>
//                   <div className="w-16 text-right">
//                     <span className={`text-sm font-medium ${getPercentageColor(criteria.certifications)}`}>
//                       {criteria.certifications}%
//                     </span>
//                   </div>
//                 </div>
//               </div>

//               {/* Total Percentage */}
//               <div className="mt-4 p-3 bg-gray-50 rounded-lg">
//                 <div className="flex justify-between items-center">
//                   <span className="text-sm font-medium">Total:</span>
//                   <span className={`text-lg ${getTotalColor()}`}>
//                     {getTotalPercentage()}%
//                   </span>
//                 </div>
//                 {!isValidCriteria() && (
//                   <p className="text-xs text-red-600 mt-1">
//                     Total must equal 100% (currently {getTotalPercentage()}%)
//                   </p>
//                 )}
//               </div>
//             </div>

//             {/* Minimum GPA */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Minimum GPA
//               </label>
//               <input
//                 type="number"
//                 min="0"
//                 max="4"
//                 step="0.1"
//                 value={minimumGPA}
//                 onChange={(e) => setMinimumGPA(parseFloat(e.target.value) || 0)}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 placeholder="e.g., 3.0"
//               />
//             </div>

//             {/* Preferred Skills */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Preferred Skills
//               </label>
              
//               <div className="flex gap-2 mb-2">
//                 <input
//                   type="text"
//                   value={newSkill}
//                   onChange={(e) => setNewSkill(e.target.value)}
//                   onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
//                   className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   placeholder="Add a skill..."
//                 />
//                 <button
//                   type="button"
//                   onClick={handleAddSkill}
//                   className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//                 >
//                   Add
//                 </button>
//               </div>

//               <div className="flex flex-wrap gap-2">
//                 {preferredSkills.map((skill, index) => (
//                   <span
//                     key={index}
//                     className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
//                   >
//                     {skill}
//                     <button
//                       type="button"
//                       onClick={() => handleRemoveSkill(skill)}
//                       className="ml-2 text-blue-600 hover:text-blue-800"
//                     >
//                       ×
//                     </button>
//                   </span>
//                 ))}
//               </div>
//             </div>

//             {error && (
//               <div className="bg-red-50 border border-red-200 rounded-lg p-3">
//                 <p className="text-red-800 text-sm">{error}</p>
//               </div>
//             )}

//             <div className="flex justify-end space-x-3 pt-4 border-t">
//               <button
//                 type="button"
//                 onClick={onClose}
//                 className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
//               >
//                 Cancel
//               </button>
//               <button
//                 type="submit"
//                 disabled={loading || !isValidCriteria()}
//                 className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 {loading ? 'Updating...' : 'Update Criteria'}
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MatchingCriteriaModal; 