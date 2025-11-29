import * as fc from 'fast-check';
import { validateResumeData, validateApiResponse, ResponseSchema } from './validation';
import { ApiError } from '../types/api';

/**
 * Arbitrary generators for resume data structures
 */

// Generator for non-empty, non-whitespace strings (required fields)
const nonEmptyStringArb = fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0);

// Generator for valid BasicInfo
const validBasicInfoArb = fc.record({
  name: nonEmptyStringArb,
  address: nonEmptyStringArb,
  email: nonEmptyStringArb,
  phone: fc.integer({ min: 1000000000, max: 9999999999 }),
  linkedin: nonEmptyStringArb,
  github: nonEmptyStringArb,
  homepage: fc.option(fc.string(), { nil: undefined }),
  summary: fc.option(fc.string(), { nil: undefined }),
});

// Generator for valid Education
const validEducationArb = fc.record({
  university: nonEmptyStringArb,
  degree: nonEmptyStringArb,
  duration: fc.option(fc.string(), { nil: undefined }),
  location: fc.option(fc.string(), { nil: undefined }),
  info: fc.option(fc.array(fc.string()), { nil: undefined }),
});

// Generator for valid Project
const validProjectArb = fc.record({
  title: nonEmptyStringArb,
  repo: fc.option(fc.string(), { nil: undefined }),
  description: fc.option(fc.array(fc.string()), { nil: undefined }),
  tools: fc.option(fc.array(fc.string()), { nil: undefined }),
});

// Generator for valid ExperienceProject
const validExperienceProjectArb = fc.record({
  title: fc.option(fc.string(), { nil: undefined }),
  details: fc.option(fc.array(fc.string()), { nil: undefined }),
  tools: fc.option(fc.array(fc.string()), { nil: undefined }),
});

// Generator for valid Experience
const validExperienceArb = fc.record({
  company: fc.option(fc.string(), { nil: undefined }),
  duration: fc.option(fc.string(), { nil: undefined }),
  location: fc.option(fc.string(), { nil: undefined }),
  title: fc.option(fc.string(), { nil: undefined }),
  projects: fc.option(fc.array(validExperienceProjectArb), { nil: undefined }),
});

// Generator for valid ResumeCreateInput/ResumeUpdateInput
const validResumeInputArb = fc.record({
  name: nonEmptyStringArb,
  keywords: fc.option(fc.array(fc.string()), { nil: undefined }),
  basic_info: fc.option(validBasicInfoArb, { nil: undefined }),
  education: fc.option(fc.array(validEducationArb), { nil: undefined }),
  projects: fc.option(fc.array(validProjectArb), { nil: undefined }),
  experiences: fc.option(fc.array(validExperienceArb), { nil: undefined }),
});

// Generator for valid Resume (with _id)
const validResumeArb = fc.record({
  _id: nonEmptyStringArb,
  name: nonEmptyStringArb,
  keywords: fc.option(fc.array(fc.string()), { nil: undefined }),
  basic_info: fc.option(validBasicInfoArb, { nil: undefined }),
  education: fc.option(fc.array(validEducationArb), { nil: undefined }),
  projects: fc.option(fc.array(validProjectArb), { nil: undefined }),
  experiences: fc.option(fc.array(validExperienceArb), { nil: undefined }),
});

// Generator for valid Template
const validTemplateArb = fc.record({
  id: nonEmptyStringArb,
  name: nonEmptyStringArb,
});

/**
 * **Feature: codebase-refactor, Property 3: Request Data Validation**
 * **Validates: Requirements 2.4**
 *
 * *For any* Resume_Data object passed to create or update operations, the ApiClient
 * SHALL validate required fields (name) exist before making the network request,
 * rejecting with a validation error if invalid.
 */
describe('Property 3: Request Data Validation', () => {
  it('should accept valid resume data with required name field', () => {
    fc.assert(
      fc.property(validResumeInputArb, (resumeData) => {
        // Should not throw for valid data
        expect(() => validateResumeData(resumeData)).not.toThrow();
      }),
      { numRuns: 100 }
    );
  });

  it('should reject resume data with missing name field', () => {
    fc.assert(
      fc.property(
        fc.record({
          keywords: fc.option(fc.array(fc.string()), { nil: undefined }),
          basic_info: fc.option(validBasicInfoArb, { nil: undefined }),
        }),
        (dataWithoutName) => {
          try {
            validateResumeData(dataWithoutName);
            fail('Expected validation error');
          } catch (error) {
            const apiError = error as ApiError;
            expect(apiError.type).toBe('validation');
            expect(apiError.message).toContain('name');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject resume data with empty name field', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('', '   ', '\t', '\n'),
        fc.option(fc.array(fc.string()), { nil: undefined }),
        (emptyName, keywords) => {
          const data = { name: emptyName, keywords };
          try {
            validateResumeData(data);
            fail('Expected validation error');
          } catch (error) {
            const apiError = error as ApiError;
            expect(apiError.type).toBe('validation');
            expect(apiError.message).toContain('name');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject non-object data types', () => {
    const invalidInputs = [null, undefined, 'string', 123, true, [], () => {}];

    for (const input of invalidInputs) {
      try {
        validateResumeData(input);
        fail('Expected validation error');
      } catch (error) {
        const apiError = error as ApiError;
        expect(apiError.type).toBe('validation');
      }
    }
  });

  it('should reject resume data with invalid keywords type', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }),
        fc.constantFrom('not-an-array', 123, { key: 'value' }),
        (name, invalidKeywords) => {
          const data = { name, keywords: invalidKeywords };
          try {
            validateResumeData(data);
            fail('Expected validation error');
          } catch (error) {
            const apiError = error as ApiError;
            expect(apiError.type).toBe('validation');
            expect(apiError.message).toContain('keywords');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject resume data with non-string keywords', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }),
        fc.array(fc.integer(), { minLength: 1 }),
        (name, invalidKeywords) => {
          const data = { name, keywords: invalidKeywords };
          try {
            validateResumeData(data);
            fail('Expected validation error');
          } catch (error) {
            const apiError = error as ApiError;
            expect(apiError.type).toBe('validation');
            expect(apiError.message).toContain('keywords');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should validate nested basic_info structure', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }),
        fc.record({
          name: fc.string({ minLength: 1 }),
          // Missing required fields: address, email, phone, linkedin, github
        }),
        (resumeName, incompleteBasicInfo) => {
          const data = { name: resumeName, basic_info: incompleteBasicInfo };
          try {
            validateResumeData(data);
            fail('Expected validation error');
          } catch (error) {
            const apiError = error as ApiError;
            expect(apiError.type).toBe('validation');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should validate education entries have required fields', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }),
        fc.array(
          fc.record({
            // Missing required fields: university, degree
            duration: fc.option(fc.string(), { nil: undefined }),
          }),
          { minLength: 1 }
        ),
        (name, invalidEducation) => {
          const data = { name, education: invalidEducation };
          try {
            validateResumeData(data);
            fail('Expected validation error');
          } catch (error) {
            const apiError = error as ApiError;
            expect(apiError.type).toBe('validation');
            expect(apiError.message).toContain('education');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should validate project entries have required title field', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }),
        fc.array(
          fc.record({
            // Missing required field: title
            repo: fc.option(fc.string(), { nil: undefined }),
          }),
          { minLength: 1 }
        ),
        (name, invalidProjects) => {
          const data = { name, projects: invalidProjects };
          try {
            validateResumeData(data);
            fail('Expected validation error');
          } catch (error) {
            const apiError = error as ApiError;
            expect(apiError.type).toBe('validation');
            expect(apiError.message).toContain('projects');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should return validation error type for all invalid inputs', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.constant({}),
          fc.constant({ name: '' }),
          fc.constant({ name: '   ' }),
          fc.constant({ keywords: 'not-array' }),
          fc.constant({ name: 'valid', education: 'not-array' }),
          fc.constant({ name: 'valid', projects: 'not-array' }),
          fc.constant({ name: 'valid', experiences: 'not-array' })
        ),
        (invalidData) => {
          try {
            validateResumeData(invalidData);
            fail('Expected validation error');
          } catch (error) {
            const apiError = error as ApiError;
            expect(apiError.type).toBe('validation');
            expect(typeof apiError.message).toBe('string');
            expect(apiError.message.length).toBeGreaterThan(0);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * **Feature: codebase-refactor, Property 4: Response Schema Validation**
 * **Validates: Requirements 2.5**
 *
 * *For any* API response received, the ApiClient SHALL validate the response structure
 * matches the expected schema, throwing a validation error if the response is malformed.
 */
describe('Property 4: Response Schema Validation', () => {
  it('should accept valid resume responses', () => {
    fc.assert(
      fc.property(validResumeArb, (resume) => {
        expect(() => validateApiResponse(resume, 'resume')).not.toThrow();
      }),
      { numRuns: 100 }
    );
  });

  it('should accept valid resume array responses', () => {
    fc.assert(
      fc.property(fc.array(validResumeArb), (resumes) => {
        expect(() => validateApiResponse(resumes, 'resumeArray')).not.toThrow();
      }),
      { numRuns: 100 }
    );
  });

  it('should accept valid createResume responses', () => {
    fc.assert(
      fc.property(
        fc.record({ id: nonEmptyStringArb }),
        (response) => {
          expect(() => validateApiResponse(response, 'createResume')).not.toThrow();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should accept valid copyResume responses', () => {
    fc.assert(
      fc.property(
        fc.record({ resume: fc.string() }),
        (response) => {
          expect(() => validateApiResponse(response, 'copyResume')).not.toThrow();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should accept valid templates responses', () => {
    fc.assert(
      fc.property(
        fc.record({ templates: fc.array(validTemplateArb) }),
        (response) => {
          expect(() => validateApiResponse(response, 'templates')).not.toThrow();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject resume responses missing _id', () => {
    fc.assert(
      fc.property(
        fc.record({
          name: fc.string({ minLength: 1 }),
          // Missing _id
        }),
        (invalidResume) => {
          try {
            validateApiResponse(invalidResume, 'resume');
            fail('Expected validation error');
          } catch (error) {
            const apiError = error as ApiError;
            expect(apiError.type).toBe('validation');
            expect(apiError.message).toContain('_id');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject resume responses missing name', () => {
    fc.assert(
      fc.property(
        fc.record({
          _id: fc.string({ minLength: 1 }),
          // Missing name
        }),
        (invalidResume) => {
          try {
            validateApiResponse(invalidResume, 'resume');
            fail('Expected validation error');
          } catch (error) {
            const apiError = error as ApiError;
            expect(apiError.type).toBe('validation');
            expect(apiError.message).toContain('name');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject non-array for resumeArray schema', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.string(),
          fc.integer(),
          fc.record({ _id: fc.string(), name: fc.string() })
        ),
        (invalidResponse) => {
          try {
            validateApiResponse(invalidResponse, 'resumeArray');
            fail('Expected validation error');
          } catch (error) {
            const apiError = error as ApiError;
            expect(apiError.type).toBe('validation');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject createResume responses missing id', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.constant({}),
          fc.constant({ id: '' }),
          fc.constant({ id: '   ' }),
          fc.constant({ otherId: 'value' })
        ),
        (invalidResponse) => {
          try {
            validateApiResponse(invalidResponse, 'createResume');
            fail('Expected validation error');
          } catch (error) {
            const apiError = error as ApiError;
            expect(apiError.type).toBe('validation');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject copyResume responses with non-string resume field', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.constant({}),
          fc.constant({ resume: 123 }),
          fc.constant({ resume: null }),
          fc.constant({ resume: [] })
        ),
        (invalidResponse) => {
          try {
            validateApiResponse(invalidResponse, 'copyResume');
            fail('Expected validation error');
          } catch (error) {
            const apiError = error as ApiError;
            expect(apiError.type).toBe('validation');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject templates responses with invalid template structure', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.constant({}),
          fc.constant({ templates: 'not-array' }),
          fc.constant({ templates: [{ id: 'valid' }] }), // Missing name
          fc.constant({ templates: [{ name: 'valid' }] }) // Missing id
        ),
        (invalidResponse) => {
          try {
            validateApiResponse(invalidResponse, 'templates');
            fail('Expected validation error');
          } catch (error) {
            const apiError = error as ApiError;
            expect(apiError.type).toBe('validation');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should return validation error type for all malformed responses', () => {
    const schemas: ResponseSchema[] = ['resume', 'resumeArray', 'createResume', 'copyResume', 'templates'];
    
    for (const schema of schemas) {
      try {
        validateApiResponse(null, schema);
        fail('Expected validation error');
      } catch (error) {
        const apiError = error as ApiError;
        expect(apiError.type).toBe('validation');
        expect(typeof apiError.message).toBe('string');
        expect(apiError.message.length).toBeGreaterThan(0);
      }
    }
  });
});
