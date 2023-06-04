import { AnonymizeNlp } from './AnonymizeNlp';

// eslint-disable-next-line max-lines-per-function
describe('AnonymizeNlp', () => {
  const anonymizeNlp = new AnonymizeNlp();

  test('should encrypt and decrypt a string', () => {
    const input = 'John Doe will be 30 on 2024-06-10.';
    const anonymized = anonymizeNlp.anonymize(input);
    expect(anonymized).toMatch('<FIRSTNAME> <LASTNAME> will be 30 on <DATE>');
    const deAnonymized = anonymizeNlp.deAnonymize(anonymized);
    expect(deAnonymized).toEqual(input);
  });

  test('should anonymize multiple names', () => {
    const input = 'John Doe and Jane Smith will meet on 2024-06-10.';
    const anonymized = anonymizeNlp.anonymize(input);
    expect(anonymized).toMatch('<FIRSTNAME> <LASTNAME> and <FIRSTNAME1> <LASTNAME1> will meet on <DATE>');
    const deAnonymized = anonymizeNlp.deAnonymize(anonymized);
    expect(deAnonymized).toEqual(input);
  });

  test('should anonymize organization names', () => {
    const input = 'John Doe works at Google.';
    const anonymized = anonymizeNlp.anonymize(input);
    expect(anonymized).toMatch('<FIRSTNAME> <LASTNAME> works at <ORGANIZATION>');
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

  test('should handle empty input string', () => {
    const input = '';
    const anonymized = anonymizeNlp.anonymize(input);
    expect(anonymized).toEqual('');
    const deAnonymized = anonymizeNlp.deAnonymize(anonymized);
    expect(deAnonymized).toEqual(input);
  });

  test('should handle multiple matches of the same type', () => {
    const input = 'John Doe has phone numbers 123-456-7890 and 098-765-4321';
    const anonymized = anonymizeNlp.anonymize(input);
    expect(anonymized).toEqual('<FIRSTNAME> <LASTNAME> has phone numbers <PHONENUMBER> and <PHONENUMBER1>');
    const deAnonymized = anonymizeNlp.deAnonymize(anonymized);
    expect(deAnonymized).toEqual(input);
  });

  test('should anonymize times', () => {
    const input = "John's meeting is at 3pm.";
    const anonymized = anonymizeNlp.anonymize(input);
    expect(anonymized).toMatch('<FIRSTNAME> meeting is at <TIME>');
    const deAnonymized = anonymizeNlp.deAnonymize(anonymized);
    expect(deAnonymized).toEqual(input);
  });

  test('should anonymize only specific types', () => {
    const anonymizeNlp = new AnonymizeNlp(['firstname', 'lastname']);
    const input = 'John Doe will be 30 on 2024-06-10.';
    const anonymized = anonymizeNlp.anonymize(input);
    // The '30' and '2024-06-10' remain as they are since only firstName and lastName are to be anonymized.
    expect(anonymized).toEqual('<FIRSTNAME> <LASTNAME> will be 30 on 2024-06-10.');
    const deAnonymized = anonymizeNlp.deAnonymize(anonymized);
    expect(deAnonymized).toEqual(input);
  });

  test('should anonymize only specific types - 2', () => {
    const anonymizeNlp1 = new AnonymizeNlp(['email']);
    const input = "John's email is john.doe@gmail.com";
    const anonymized = anonymizeNlp1.anonymize(input);
    // The 'John' remains as it is since only email is to be anonymized.
    expect(anonymized).toEqual("John's email is <EMAIL>");
    const deAnonymized = anonymizeNlp1.deAnonymize(anonymized);
    expect(deAnonymized).toEqual(input);
  });

  test('should not anonymize any type', () => {
    const anonymizeNlp2 = new AnonymizeNlp([]);
    const input = 'John Doe will be 30 on 2024-06-10.';
    const anonymized = anonymizeNlp2.anonymize(input);
    // The input remains as it is since no types are to be anonymized.
    expect(anonymized).toEqual(input);
    const deAnonymized = anonymizeNlp2.deAnonymize(anonymized);
    expect(deAnonymized).toEqual(input);
  });

  test('should anonymize credit card numbers', () => {
    const input = "John's credit card number is 4111-1111-1111-1111";
    const anonymized = anonymizeNlp.anonymize(input);
    expect(anonymized).toEqual('<FIRSTNAME> credit card number is <CREDITCARD>');
    const deAnonymized = anonymizeNlp.deAnonymize(anonymized);
    expect(deAnonymized).toEqual(input);
  });

  test('should anonymize multiple credit card numbers', () => {
    const input = "John's credit card numbers are 4111-1111-1111-1111 and 5500-0000-0000-0004";
    const anonymized = anonymizeNlp.anonymize(input);
    expect(anonymized).toEqual('<FIRSTNAME> credit card numbers are <CREDITCARD> and <CREDITCARD1>');
    const deAnonymized = anonymizeNlp.deAnonymize(anonymized);
    expect(deAnonymized).toEqual(input);
  });
});
