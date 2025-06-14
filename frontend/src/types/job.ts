export type Job = {
    id: string
    company: {
      name: string
      logo: string
      rating: number
    }
    title: string
    location: string
    salary: string
    postedDays: number
    isEasyApply?: boolean
    isSaved?: boolean
  }
  