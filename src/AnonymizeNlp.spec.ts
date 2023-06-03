import { AnonymizeNlp } from './AnonymizeNlp';

describe('AnonymizeNlp', () => {
  const anonymizeNlp = new AnonymizeNlp();

  test('should encrypt and decrypt a string', () => {
    const input = 'John Doe will be 30 on 2024-06-10.';
    const anonymized = anonymizeNlp.anonymize(input);
    expect(anonymized).toEqual('<FIRSTNAME> <LASTNAME> will be <DATE>');
    const deAnonymized = anonymizeNlp.deAnonymize(anonymized);
    expect(deAnonymized).toEqual(input);
  });

  test('should anonymize multiple names', () => {
    const input = 'John Doe and Jane Smith will meet on 2024-06-10.';
    const anonymized = anonymizeNlp.anonymize(input);
    expect(anonymized).toEqual('<FIRSTNAME> <LASTNAME> and <FIRSTNAME1> <LASTNAME1> will meet <DATE>');
    const deAnonymized = anonymizeNlp.deAnonymize(anonymized);
    expect(deAnonymized).toEqual(input);
  });

  test('should anonymize organization names', () => {
    const input = 'John Doe works at Google.';
    const anonymized = anonymizeNlp.anonymize(input);
    expect(anonymized).toEqual('<FIRSTNAME> <LASTNAME> works at <ORGANIZATION>');
    const deAnonymized = anonymizeNlp.deAnonymize(anonymized);
    expect(deAnonymized).toEqual(input);
  });

  test('should anonymize email addresses', () => {
    const input = "John's email is john.doe@gmail.com";
    const anonymized = anonymizeNlp.anonymize(input);
    expect(anonymized).toEqual('<FIRSTNAME> email is <EMAIL>');
    const deAnonymized = anonymizeNlp.deAnonymize(anonymized);
    expect(deAnonymized).toEqual(input);
  });

  test('should anonymize phone numbers', () => {
    const input = "John's phone number is 123-456-7890";
    const anonymized = anonymizeNlp.anonymize(input);
    expect(anonymized).toEqual('<FIRSTNAME> phone number is <PHONENUMBER>');
    const deAnonymized = anonymizeNlp.deAnonymize(anonymized);
    expect(deAnonymized).toEqual(input);
  });

  test('should anonymize money-related strings', () => {
    const input = 'John has $1000 in his account.';
    const anonymized = anonymizeNlp.anonymize(input);
    expect(anonymized).toEqual('<FIRSTNAME> has <MONEY> in his account.');
    const deAnonymized = anonymizeNlp.deAnonymize(anonymized);
    expect(deAnonymized).toEqual(input);
  });
});
