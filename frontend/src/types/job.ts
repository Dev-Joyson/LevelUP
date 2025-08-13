export type Job = {
  _id: string
  companyId?: {
    _id: string
    name: string
    logo?: string
  }
  company?: {
    name: string
    logo?: string
  }
  title: string
  description: string
  aboutRole?: string
  domain?: string
  duration?: string
  location: string
  salary: {
    min: number
    max: number
    currency?: string
    display?: string
  }
  workMode: 'remote' | 'onsite' | 'hybrid'
  criteria?: {
    skills: string[]
    education: string
  }
  requirements?: string[]
  benefits?: string[]
  preferredSkills?: string[]
  minimumGPA?: number
  positions?: number
  applicationDeadline?: string
  isPublished?: boolean
  isVerified?: boolean
  isArchived?: boolean
  createdAt: string
  
  // For compatibility with existing components
  postedDays?: number
  isEasyApply?: boolean
  isSaved?: boolean
}

export type InternshipDetail = Job & {
  qualifications?: { skill: string; match: boolean }[]
  jobType?: string
}
  