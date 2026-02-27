import type {
  Resume,
  ResumeEducation,
  ResumeEducationLevel,
  ResumeEmploymentType,
  ResumeExperience,
  ResumeSkill,
  ResumeSkillLevel,
} from '~/composables/useResumeApi'

export type ResumeSectionType = 'experience' | 'education' | 'skill'

export interface ResumeAggregate {
  resume: Resume
  experiences: ResumeExperience[]
  educations: ResumeEducation[]
  skills: ResumeSkill[]
}

/**
 * Default value convention:
 * - string/date inputs: ''
 * - enum/number optional inputs: null
 * - PATCH omission marker: undefined (generated only by mapper functions)
 */
export interface ResumeFormModel {
  title: string
  headline: string
  summary: string
  location: string
  isPublic: boolean
}

export interface ResumeExperienceFormModel {
  resume: string
  company: string
  role: string
  startDate: string
  endDate: string
  description: string
  employmentType: ResumeEmploymentType | null
  location: string
  isCurrent: boolean
}

export interface ResumeEducationFormModel {
  resume: string
  institution: string
  degree: string
  fieldOfStudy: string
  level: ResumeEducationLevel | null
  startDate: string
  endDate: string
  description: string
  isCurrent: boolean
}

export interface ResumeSkillFormModel {
  resume: string
  name: string
  level: ResumeSkillLevel | null
  yearsOfExperience: number | null
}
