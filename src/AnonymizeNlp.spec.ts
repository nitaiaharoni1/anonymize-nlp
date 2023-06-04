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

  test('should test long paragraph', () => {
    const input = `My name is Jessica Thompson, and I was born on May 12, 1988, in a small town called Oakdale. I grew up with my parents and two siblings, an older brother named Daniel and a younger sister named Emily. We lived in a cozy two-story house with a white picket fence. In high school, I was actively involved in the drama club and played the lead role in our school's production of "Romeo and Juliet." After graduation, I pursued my passion for writing and earned a Bachelor's degree in English Literature from the University of Cambridge in 2010. Currently, I work as a freelance writer, specializing in content creation for various online platforms.
If you'd like to reach me, you can email me at johndoe1985@example.com or give me a call at +1 (555) 123-4567.
Please note that the credit card number provided, 4916 2899 5678 1234, is purely fictional and should not be used for any actual transactions or financial purposes.
In my free time, I enjoy hiking, painting, and playing the guitar. I'm also an avid traveler and have visited over 20 countries, each leaving a unique mark on my adventurous soul.
Please remember that all the information provided, including the credit card number, email address, and phone number, is entirely fictional and randomly generated. It does not represent any real individuals or their personal experiences.`;
    const anonymized = anonymizeNlp.anonymize(input);
    expect(anonymized).toEqual(
      `My name is <FIRSTNAME> <LASTNAME>, and I was born on <DATE>, in a small town called Oakdale. I grew up with my parents and two siblings, an older brother named <FIRSTNAME1> and a younger sister named <FIRSTNAME2>. We lived in a cozy two-story house with a white picket fence. In high school, I was actively involved in the drama club and played the lead role in our school's production of "<FIRSTNAME3> and <FIRSTNAME4>." <LASTNAME1> graduation, I pursued my passion for writing and earned a Bachelor's degree in English Literature from the University of Cambridge in <DATE3>. Currently, I work as a freelance writer, specializing in content creation for various online platforms.
If you'd like to reach me, you can email me at <EMAIL> or give me a call at +1 (<PHONENUMBER2>) <DATE1>3-4567.
Please note that the credit card number provided, <CREDITCARD>, is purely fictional and should not be used for any actual transactions or financial purposes.
In my free time, I enjoy hiking, painting, and playing the guitar. I'm also an avid traveler and have visited over 20 countries, each leaving a unique <FIRSTNAME5> on my adventurous soul.
Please remember that all the information provided, including the credit card number, email address, and phone number, is entirely fictional and randomly generated. It does not represent any real individuals or their personal experiences.`,
    );
    const deAnonymized = anonymizeNlp.deAnonymize(anonymized);
    expect(deAnonymized).toEqual(input);
  });

  test('should anonymize email and phone number', () => {
    const input = `Hi i'm John Doe, my email is john@example.com and my phone number is +1-234-567-8900.`;
    const anonymized = anonymizeNlp.anonymize(input);
    expect(anonymized).toEqual(`Hi i'm <FIRSTNAME> <LASTNAME>, my email is <EMAIL> and my phone number is <PHONENUMBER>.`);
    const deAnonymized = anonymizeNlp.deAnonymize(anonymized);
    expect(deAnonymized).toEqual(input);
  });
});
