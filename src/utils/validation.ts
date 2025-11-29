/**
 * Validation Utilities
 * Functions for validating request data and API responses
 */

import { ApiError } from '../types/api';
import { ResumeCreateInput, ResumeUpdateInput } from '../types/resume';

/**
 * Validation result type
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Creates a validation error with the 'validation' type
 */
function createValidationError(message: string): ApiError {
  return {
    type: 'validation',
    message,
  };
}

/**
 * Checks if a value is a non-empty string
 */
function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Checks if a value is a valid object (not null, not array)
 */
function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Checks if a value is an array
 */
function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

/**
 * Validates BasicInfo structure
 */
function validateBasicInfo(basicInfo: unknown): ValidationResult {
  const errors: string[] = [];

  if (!isObject(basicInfo)) {
    return { valid: false, errors: ['basic_info must be an object'] };
  }

  const info = basicInfo as Record<string, unknown>;

  if (!isNonEmptyString(info.name)) {
    errors.push('basic_info.name is required and must be a non-empty string');
  }
  if (!isNonEmptyString(info.address)) {
    errors.push('basic_info.address is required and must be a non-empty string');
  }
  if (!isNonEmptyString(info.email)) {
    errors.push('basic_info.email is required and must be a non-empty string');
  }
  if (typeof info.phone !== 'string' && typeof info.phone !== 'number') {
    errors.push('basic_info.phone is required and must be a string or number');
  }
  if (!isNonEmptyString(info.linkedin)) {
    errors.push('basic_info.linkedin is required and must be a non-empty string');
  }
  if (!isNonEmptyString(info.github)) {
    errors.push('basic_info.github is required and must be a non-empty string');
  }

  // Optional fields
  if (info.homepage !== undefined && typeof info.homepage !== 'string') {
    errors.push('basic_info.homepage must be a string if provided');
  }
  if (info.summary !== undefined && typeof info.summary !== 'string') {
    errors.push('basic_info.summary must be a string if provided');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validates Education entry
 */
function validateEducation(education: unknown, index: number): ValidationResult {
  const errors: string[] = [];

  if (!isObject(education)) {
    return { valid: false, errors: [`education[${index}] must be an object`] };
  }

  const edu = education as Record<string, unknown>;

  if (!isNonEmptyString(edu.university)) {
    errors.push(`education[${index}].university is required and must be a non-empty string`);
  }
  if (!isNonEmptyString(edu.degree)) {
    errors.push(`education[${index}].degree is required and must be a non-empty string`);
  }

  // Optional fields
  if (edu.duration !== undefined && typeof edu.duration !== 'string') {
    errors.push(`education[${index}].duration must be a string if provided`);
  }
  if (edu.location !== undefined && typeof edu.location !== 'string') {
    errors.push(`education[${index}].location must be a string if provided`);
  }
  if (edu.info !== undefined) {
    if (!isArray(edu.info)) {
      errors.push(`education[${index}].info must be an array if provided`);
    } else if (!edu.info.every((item) => typeof item === 'string')) {
      errors.push(`education[${index}].info must contain only strings`);
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validates Project entry
 */
function validateProject(project: unknown, index: number): ValidationResult {
  const errors: string[] = [];

  if (!isObject(project)) {
    return { valid: false, errors: [`projects[${index}] must be an object`] };
  }

  const proj = project as Record<string, unknown>;

  if (!isNonEmptyString(proj.title)) {
    errors.push(`projects[${index}].title is required and must be a non-empty string`);
  }

  // Optional fields
  if (proj.repo !== undefined && typeof proj.repo !== 'string') {
    errors.push(`projects[${index}].repo must be a string if provided`);
  }
  if (proj.description !== undefined) {
    if (!isArray(proj.description)) {
      errors.push(`projects[${index}].description must be an array if provided`);
    } else if (!proj.description.every((item) => typeof item === 'string')) {
      errors.push(`projects[${index}].description must contain only strings`);
    }
  }
  if (proj.tools !== undefined) {
    if (!isArray(proj.tools)) {
      errors.push(`projects[${index}].tools must be an array if provided`);
    } else if (!proj.tools.every((item) => typeof item === 'string')) {
      errors.push(`projects[${index}].tools must contain only strings`);
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validates ExperienceProject entry
 */
function validateExperienceProject(
  expProject: unknown,
  expIndex: number,
  projIndex: number
): ValidationResult {
  const errors: string[] = [];

  if (!isObject(expProject)) {
    return {
      valid: false,
      errors: [`experiences[${expIndex}].projects[${projIndex}] must be an object`],
    };
  }

  const proj = expProject as Record<string, unknown>;

  // All fields are optional
  if (proj.title !== undefined && typeof proj.title !== 'string') {
    errors.push(
      `experiences[${expIndex}].projects[${projIndex}].title must be a string if provided`
    );
  }
  if (proj.details !== undefined) {
    if (!isArray(proj.details)) {
      errors.push(
        `experiences[${expIndex}].projects[${projIndex}].details must be an array if provided`
      );
    } else if (!proj.details.every((item) => typeof item === 'string')) {
      errors.push(
        `experiences[${expIndex}].projects[${projIndex}].details must contain only strings`
      );
    }
  }
  if (proj.tools !== undefined) {
    if (!isArray(proj.tools)) {
      errors.push(
        `experiences[${expIndex}].projects[${projIndex}].tools must be an array if provided`
      );
    } else if (!proj.tools.every((item) => typeof item === 'string')) {
      errors.push(
        `experiences[${expIndex}].projects[${projIndex}].tools must contain only strings`
      );
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validates Experience entry
 */
function validateExperience(experience: unknown, index: number): ValidationResult {
  const errors: string[] = [];

  if (!isObject(experience)) {
    return { valid: false, errors: [`experiences[${index}] must be an object`] };
  }

  const exp = experience as Record<string, unknown>;

  // All top-level fields are optional
  if (exp.company !== undefined && typeof exp.company !== 'string') {
    errors.push(`experiences[${index}].company must be a string if provided`);
  }
  if (exp.duration !== undefined && typeof exp.duration !== 'string') {
    errors.push(`experiences[${index}].duration must be a string if provided`);
  }
  if (exp.location !== undefined && typeof exp.location !== 'string') {
    errors.push(`experiences[${index}].location must be a string if provided`);
  }
  if (exp.title !== undefined && typeof exp.title !== 'string') {
    errors.push(`experiences[${index}].title must be a string if provided`);
  }

  // Validate nested projects
  if (exp.projects !== undefined) {
    if (!isArray(exp.projects)) {
      errors.push(`experiences[${index}].projects must be an array if provided`);
    } else {
      exp.projects.forEach((proj, projIndex) => {
        const result = validateExperienceProject(proj, index, projIndex);
        errors.push(...result.errors);
      });
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validates resume data for create/update operations
 * Ensures required fields exist before making network requests
 *
 * @param data - The resume data to validate
 * @returns ValidationResult with valid flag and any errors
 * @throws ApiError with type 'validation' if data is invalid
 */
export function validateResumeData(
  data: unknown
): asserts data is ResumeCreateInput | ResumeUpdateInput {
  const errors: string[] = [];

  if (!isObject(data)) {
    throw createValidationError('Resume data must be an object');
  }

  const resumeData = data as Record<string, unknown>;

  // Required field: name
  if (!isNonEmptyString(resumeData.name)) {
    errors.push('name is required and must be a non-empty string');
  }

  // Optional field: keywords
  if (resumeData.keywords !== undefined) {
    if (!isArray(resumeData.keywords)) {
      errors.push('keywords must be an array if provided');
    } else if (!resumeData.keywords.every((k) => typeof k === 'string')) {
      errors.push('keywords must contain only strings');
    }
  }

  // Optional field: basic_info
  if (resumeData.basic_info !== undefined) {
    const basicInfoResult = validateBasicInfo(resumeData.basic_info);
    errors.push(...basicInfoResult.errors);
  }

  // Optional field: education
  if (resumeData.education !== undefined) {
    if (!isArray(resumeData.education)) {
      errors.push('education must be an array if provided');
    } else {
      resumeData.education.forEach((edu, index) => {
        const result = validateEducation(edu, index);
        errors.push(...result.errors);
      });
    }
  }

  // Optional field: projects
  if (resumeData.projects !== undefined) {
    if (!isArray(resumeData.projects)) {
      errors.push('projects must be an array if provided');
    } else {
      resumeData.projects.forEach((proj, index) => {
        const result = validateProject(proj, index);
        errors.push(...result.errors);
      });
    }
  }

  // Optional field: experiences
  if (resumeData.experiences !== undefined) {
    if (!isArray(resumeData.experiences)) {
      errors.push('experiences must be an array if provided');
    } else {
      resumeData.experiences.forEach((exp, index) => {
        const result = validateExperience(exp, index);
        errors.push(...result.errors);
      });
    }
  }

  if (errors.length > 0) {
    throw createValidationError(`Invalid resume data: ${errors.join('; ')}`);
  }
}

/**
 * Validates a Template object
 */
function validateTemplate(template: unknown, index: number): ValidationResult {
  const errors: string[] = [];

  if (!isObject(template)) {
    return { valid: false, errors: [`templates[${index}] must be an object`] };
  }

  const tmpl = template as Record<string, unknown>;

  if (!isNonEmptyString(tmpl.id)) {
    errors.push(`templates[${index}].id is required and must be a non-empty string`);
  }
  if (!isNonEmptyString(tmpl.name)) {
    errors.push(`templates[${index}].name is required and must be a non-empty string`);
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validates a Resume response object
 */
function validateResumeResponse(resume: unknown): ValidationResult {
  const errors: string[] = [];

  if (!isObject(resume)) {
    return { valid: false, errors: ['Response must be an object'] };
  }

  const res = resume as Record<string, unknown>;

  // Required fields for Resume response (API returns 'id', not '_id')
  if (!isNonEmptyString(res.id) && !isNonEmptyString(res._id)) {
    errors.push('id or _id is required and must be a non-empty string');
  }
  if (!isNonEmptyString(res.name)) {
    errors.push('name is required and must be a non-empty string');
  }

  // Validate optional nested structures if present
  if (res.basic_info !== undefined) {
    const basicInfoResult = validateBasicInfo(res.basic_info);
    errors.push(...basicInfoResult.errors);
  }

  if (res.education !== undefined) {
    if (!isArray(res.education)) {
      errors.push('education must be an array if provided');
    } else {
      res.education.forEach((edu, index) => {
        const result = validateEducation(edu, index);
        errors.push(...result.errors);
      });
    }
  }

  if (res.projects !== undefined) {
    if (!isArray(res.projects)) {
      errors.push('projects must be an array if provided');
    } else {
      res.projects.forEach((proj, index) => {
        const result = validateProject(proj, index);
        errors.push(...result.errors);
      });
    }
  }

  if (res.experiences !== undefined) {
    if (!isArray(res.experiences)) {
      errors.push('experiences must be an array if provided');
    } else {
      res.experiences.forEach((exp, index) => {
        const result = validateExperience(exp, index);
        errors.push(...result.errors);
      });
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Schema types for API response validation
 */
export type ResponseSchema =
  | 'resume'
  | 'resumeArray'
  | 'createResume'
  | 'copyResume'
  | 'templates';

/**
 * Validates API response against expected schema
 * Ensures response structure matches what the application expects
 *
 * @param response - The API response data to validate
 * @param schema - The expected schema type
 * @throws ApiError with type 'validation' if response is malformed
 */
export function validateApiResponse<T>(response: unknown, schema: ResponseSchema): asserts response is T {
  const errors: string[] = [];

  switch (schema) {
    case 'resume': {
      const result = validateResumeResponse(response);
      errors.push(...result.errors);
      break;
    }

    case 'resumeArray': {
      if (!isArray(response)) {
        throw createValidationError('Expected array of resumes');
      }
      response.forEach((resume, index) => {
        const result = validateResumeResponse(resume);
        if (!result.valid) {
          errors.push(`Resume at index ${index}: ${result.errors.join('; ')}`);
        }
      });
      break;
    }

    case 'createResume': {
      if (!isObject(response)) {
        throw createValidationError('Expected object with id field');
      }
      const res = response as Record<string, unknown>;
      if (!isNonEmptyString(res.id)) {
        errors.push('id is required and must be a non-empty string');
      }
      break;
    }

    case 'copyResume': {
      if (!isObject(response)) {
        throw createValidationError('Expected object with resume field');
      }
      const res = response as Record<string, unknown>;
      if (typeof res.resume !== 'string') {
        errors.push('resume field is required and must be a string');
      }
      break;
    }

    case 'templates': {
      if (!isObject(response)) {
        throw createValidationError('Expected object with templates array');
      }
      const res = response as Record<string, unknown>;
      if (!isArray(res.templates)) {
        errors.push('templates field is required and must be an array');
      } else {
        res.templates.forEach((template, index) => {
          const result = validateTemplate(template, index);
          errors.push(...result.errors);
        });
      }
      break;
    }

    default:
      throw createValidationError(`Unknown schema type: ${schema}`);
  }

  if (errors.length > 0) {
    throw createValidationError(`Invalid API response: ${errors.join('; ')}`);
  }
}
