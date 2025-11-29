/**
 * Resume Types
 * TypeScript interfaces for all resume-related data models
 */

/**
 * Basic personal information for a resume
 */
export interface BasicInfo {
  name: string;
  address: string;
  email: string;
  phone: string | number; // string preferred, number for backward compatibility
  linkedin: string;
  github: string;
  homepage?: string;
  summary?: string;
}

/**
 * Education entry in a resume
 */
export interface Education {
  university: string;
  duration?: string;
  location?: string;
  degree: string;
  info?: string[];
}

/**
 * Academic or personal project entry
 */
export interface Project {
  title: string;
  repo?: string;
  description?: string[];
  tools?: string[];
}

/**
 * Project within a work experience entry
 */
export interface ExperienceProject {
  title?: string;
  details?: string[];
  tools?: string[];
}

/**
 * Work experience entry
 */
export interface Experience {
  company?: string;
  duration?: string;
  location?: string;
  title?: string;
  projects?: ExperienceProject[];
}

/**
 * Complete resume data structure
 */
export interface Resume {
  _id: string;
  name: string;
  keywords?: string[];
  basic_info?: BasicInfo;
  education?: Education[];
  projects?: Project[];
  experiences?: Experience[];
}

/**
 * Input type for creating a new resume (without _id)
 */
export type ResumeCreateInput = Omit<Resume, '_id'>;

/**
 * Input type for updating an existing resume (without _id)
 */
export type ResumeUpdateInput = Omit<Resume, '_id'>;
