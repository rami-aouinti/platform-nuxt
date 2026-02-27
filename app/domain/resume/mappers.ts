import type {
  CreateResumeEducationPayload,
  CreateResumeExperiencePayload,
  CreateResumePayload,
  CreateResumeSkillPayload,
  PatchResumeEducationPayload,
  PatchResumeExperiencePayload,
  PatchResumePayload,
  PatchResumeSkillPayload,
  Resume,
  ResumeEducation,
  ResumeExperience,
  ResumeSkill,
  UpdateResumeEducationPayload,
  UpdateResumeExperiencePayload,
  UpdateResumePayload,
  UpdateResumeSkillPayload,
} from '~/composables/useResumeApi'
import type {
  ResumeEducationFormModel,
  ResumeExperienceFormModel,
  ResumeFormModel,
  ResumeSkillFormModel,
} from '~/types/resume'

function toText(value: string | null | undefined): string {
  return value ?? ''
}

function toOptionalText(value: string): string | undefined {
  const trimmedValue = value.trim()
  return trimmedValue ? trimmedValue : undefined
}

function toOptionalDate(value: string): string | null | undefined {
  const trimmedValue = value.trim()
  return trimmedValue ? trimmedValue : null
}

function toPatch<T extends object>(next: T, previous?: Partial<T>): Partial<T> {
  if (!previous) return next

  return Object.fromEntries(
    Object.entries(next as Record<string, unknown>).filter(([key, value]) => previous[key as keyof T] !== value),
  ) as Partial<T>
}

export function mapResumeApiToFormModel(resume?: Resume | null): ResumeFormModel {
  return {
    title: toText(resume?.title),
    headline: toText(resume?.headline),
    summary: toText(resume?.summary),
    location: toText(resume?.location),
    isPublic: Boolean(resume?.isPublic),
  }
}

export function mapResumeFormModelToCreatePayload(form: ResumeFormModel): CreateResumePayload {
  return {
    title: form.title.trim(),
    headline: toOptionalText(form.headline),
    summary: toOptionalText(form.summary),
    location: toOptionalText(form.location),
    isPublic: form.isPublic,
  }
}

export function mapResumeFormModelToUpdatePayload(form: ResumeFormModel): UpdateResumePayload {
  return mapResumeFormModelToCreatePayload(form)
}

export function mapResumeFormModelToPatchPayload(form: ResumeFormModel, previous?: ResumeFormModel): PatchResumePayload {
  return toPatch(mapResumeFormModelToUpdatePayload(form), previous ? mapResumeFormModelToUpdatePayload(previous) : undefined)
}

export function mapResumeExperienceApiToFormModel(experience?: ResumeExperience | null, resumeId = ''): ResumeExperienceFormModel {
  return {
    resume: experience?.resume ?? resumeId,
    company: toText(experience?.company),
    role: toText(experience?.role),
    startDate: toText(experience?.startDate),
    endDate: toText(experience?.endDate ?? undefined),
    description: toText(experience?.description),
    employmentType: experience?.employmentType ?? null,
    location: toText(experience?.location),
    isCurrent: Boolean(experience?.isCurrent),
  }
}

export function mapResumeExperienceFormModelToCreatePayload(form: ResumeExperienceFormModel): CreateResumeExperiencePayload {
  return {
    resume: form.resume,
    company: form.company.trim(),
    role: form.role.trim(),
    startDate: form.startDate,
    endDate: form.isCurrent ? null : toOptionalDate(form.endDate),
    description: toOptionalText(form.description),
    employmentType: form.employmentType ?? undefined,
    location: toOptionalText(form.location),
    isCurrent: form.isCurrent,
  }
}

export function mapResumeExperienceFormModelToUpdatePayload(form: ResumeExperienceFormModel): UpdateResumeExperiencePayload {
  return mapResumeExperienceFormModelToCreatePayload(form)
}

export function mapResumeExperienceFormModelToPatchPayload(
  form: ResumeExperienceFormModel,
  previous?: ResumeExperienceFormModel,
): PatchResumeExperiencePayload {
  return toPatch(
    mapResumeExperienceFormModelToUpdatePayload(form),
    previous ? mapResumeExperienceFormModelToUpdatePayload(previous) : undefined,
  )
}

export function mapResumeEducationApiToFormModel(education?: ResumeEducation | null, resumeId = ''): ResumeEducationFormModel {
  return {
    resume: education?.resume ?? resumeId,
    institution: toText(education?.institution),
    degree: toText(education?.degree),
    fieldOfStudy: toText(education?.fieldOfStudy),
    level: education?.level ?? null,
    startDate: toText(education?.startDate),
    endDate: toText(education?.endDate ?? undefined),
    description: toText(education?.description),
    isCurrent: Boolean(education?.isCurrent),
  }
}

export function mapResumeEducationFormModelToCreatePayload(form: ResumeEducationFormModel): CreateResumeEducationPayload {
  return {
    resume: form.resume,
    institution: form.institution.trim(),
    degree: toOptionalText(form.degree),
    fieldOfStudy: toOptionalText(form.fieldOfStudy),
    level: form.level ?? undefined,
    startDate: toOptionalText(form.startDate),
    endDate: form.isCurrent ? null : toOptionalDate(form.endDate),
    description: toOptionalText(form.description),
    isCurrent: form.isCurrent,
  }
}

export function mapResumeEducationFormModelToUpdatePayload(form: ResumeEducationFormModel): UpdateResumeEducationPayload {
  return mapResumeEducationFormModelToCreatePayload(form)
}

export function mapResumeEducationFormModelToPatchPayload(
  form: ResumeEducationFormModel,
  previous?: ResumeEducationFormModel,
): PatchResumeEducationPayload {
  return toPatch(
    mapResumeEducationFormModelToUpdatePayload(form),
    previous ? mapResumeEducationFormModelToUpdatePayload(previous) : undefined,
  )
}

export function mapResumeSkillApiToFormModel(skill?: ResumeSkill | null, resumeId = ''): ResumeSkillFormModel {
  return {
    resume: skill?.resume ?? resumeId,
    name: toText(skill?.name),
    level: skill?.level ?? null,
    yearsOfExperience: typeof skill?.yearsOfExperience === 'number' ? skill.yearsOfExperience : null,
  }
}

export function mapResumeSkillFormModelToCreatePayload(form: ResumeSkillFormModel): CreateResumeSkillPayload {
  return {
    resume: form.resume,
    name: form.name.trim(),
    level: form.level ?? undefined,
    yearsOfExperience: form.yearsOfExperience ?? undefined,
  }
}

export function mapResumeSkillFormModelToUpdatePayload(form: ResumeSkillFormModel): UpdateResumeSkillPayload {
  return mapResumeSkillFormModelToCreatePayload(form)
}

export function mapResumeSkillFormModelToPatchPayload(form: ResumeSkillFormModel, previous?: ResumeSkillFormModel): PatchResumeSkillPayload {
  return toPatch(mapResumeSkillFormModelToUpdatePayload(form), previous ? mapResumeSkillFormModelToUpdatePayload(previous) : undefined)
}
