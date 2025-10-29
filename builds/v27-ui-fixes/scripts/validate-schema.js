/**
 * v27 schema validation stub.
 * Ensures Session__c and Survey_Response__c payloads expose required fields before UI binding.
 */

const expectedSessionFields = [
  'Id',
  'Name',
  'Presenter__c',
  'Total_Students__c',
  'Year_Levels__c',
  'ATSI_Count__c',
  'Delivery_Mode__c',
  'Scheduled_Date__c'
];

const expectedSurveyFields = [
  'Id',
  'Related_Session__c',
  'Type__c',
  'Status__c',
  'Link__c',
  'Reminder_Status__c'
];

function validateSession(sessionRecord = {}) {
  return expectedSessionFields.every((field) => Object.prototype.hasOwnProperty.call(sessionRecord, field));
}

function validateSurvey(surveyRecord = {}) {
  return expectedSurveyFields.every((field) => Object.prototype.hasOwnProperty.call(surveyRecord, field));
}

function assertRecord(record, validator, typeName = 'record') {
  if (!validator(record)) {
    const missing = (validator === validateSession ? expectedSessionFields : expectedSurveyFields)
      .filter((field) => !Object.prototype.hasOwnProperty.call(record, field));
    throw new Error(`Missing ${typeName} fields: ${missing.join(', ')}`);
  }
  return true;
}

module.exports = {
  expectedSessionFields,
  expectedSurveyFields,
  validateSession,
  validateSurvey,
  assertRecord
};
