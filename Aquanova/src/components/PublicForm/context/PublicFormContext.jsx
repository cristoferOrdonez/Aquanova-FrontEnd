// src/components/PublicForm/context/PublicFormContext.jsx
import { createContext } from 'react';

/**
 * @typedef {object} SchemaField
 * @property {string} key
 * @property {'text'|'textarea'|'email'|'tel'|'password'|'radio'|'select'|'checkbox'|'range'} type
 * @property {string} label
 * @property {boolean} required
 * @property {string[]} [options]
 * @property {string}  [placeholder]
 * @property {number}  [min]
 * @property {number}  [max]
 */

/**
 * @typedef {object} RegistrationFieldDef
 * @property {boolean} required
 * @property {'text'|'email'|'tel'|'password'} type
 * @property {string} label
 */

/**
 * @typedef {object} PublicFormData
 * @property {string} id
 * @property {string} key
 * @property {string} title
 * @property {string} [description]
 * @property {{imagen: string}|null} metadata
 * @property {string} neighborhood_id
 * @property {number} version
 * @property {SchemaField[]} schema
 * @property {{points_per_referral: number, is_active: boolean}} giveaway
 * @property {Object.<string, RegistrationFieldDef>} registration_fields
 */

/**
 * @typedef {object} OnboardingResult
 * @property {string} token
 * @property {{id: string, name: string, document_number: string, email: string, role: string}} user
 * @property {string} submissionId
 * @property {string} referral_code
 * @property {string} share_link
 * @property {{reconciled: boolean, points_awarded: number}} reconciliation
 */

/**
 * @typedef {object} PublicFormContextType
 * @property {PublicFormData|null} formData
 * @property {boolean} loading
 * @property {string|null} error
 * @property {number|null} errorStatus
 * @property {boolean} submitting
 * @property {OnboardingResult|null} successData
 * @property {Object.<string, string|number|string[]>} responses
 * @property {Object.<string, string>} registration
 * @property {Object.<string, string>} fieldErrors
 * @property {(key: string, value: string|number|string[]) => void} setResponse
 * @property {(key: string, value: string) => void} setRegistration
 * @property {() => Promise<void>} handleSubmit
 */

/** @type {import('react').Context<PublicFormContextType|undefined>} */
export const PublicFormContext = createContext(undefined);
