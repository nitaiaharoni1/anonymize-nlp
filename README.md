# AnonymizeNLP

Anonymize-NLP is a lightweight and robust package for text anonymization. It uses Natural Language Processing (NLP) and Regular Expressions (Regex) to identify and mask sensitive information in a string.

## Features

- Anonymize specific categories in a text, including emails, monetary values, organizations, people, and phone numbers and more.
- Customizable anonymization: Specify which categories to anonymize and which to exclude.
- De-anonymization: Revert anonymized text back to its original form.
- Built-in compatibility with nlp NER - compromise.

## Installation

Install Anonymize-NLP and its peer dependencies with npm.

```bash
npm i anonymize-nlp
```

## Usage

```javascript
import { AnonymizeNlp } from 'anonymizenlp';

const anonymizer = new AnonymizeNlp();
const anonymizedText = anonymizer.anonymize(`Hi I'm John Doe, my email is john@example.com and my phone number is +1-234-567-8900.`);

console.log(anonymizedText);
// Output: "Hi I'm <FIRSTNAME> <LASTNAME>, my email is <EMAIL> and my phone number is <PHONENUMBER>."

const originalText = anonymizer.deAnonymize(anonymizedText);
console.log(originalText);
// Output: "Hi I'm John Doe, my email is john@example.com and my phone number is +1-234-567-8900."
```

## API

### Create a new AnonymizeNlp instance. 
By default, all types are anonymized.

`constructor(typesToAnonymize: AnonymizeType[] = anonymizeTypeOptions, typesToExclude: AnonymizeType[] = [])`


- `typesToAnonymize`: Array of `AnonymizeType` that you want to anonymize in the text.
- `typesToExclude`: Array of `AnonymizeType` that you want to exclude from anonymization.

```typescript
type AnonymizeType =
  | 'date'
  | 'email'
  | 'firstname'
  | 'lastname'
  | 'money'
  | 'organization'
  | 'phonenumber'
  | 'time'
  | 'creditcard'
  | 'domain'
  | 'ip'
  | 'token'
  | 'url'
  | 'id'
  | 'zip_code'
  | 'crypto'
  | 'apikey';
```

### anonymize(input: string): string

Anonymizes the specified categories in the given text.

- `input`: The text to be anonymized.

### deAnonymize(input: string): string

Reverts the anonymized text back to its original form.

- `input`: The anonymized text.

## Contributing

Contributions to this project are welcome! If you would like to contribute, please follow these steps:

1. Fork the repository on GitHub.
2. Clone your fork to your local machine.
3. Create a new branch for your changes.
4. Make your changes and commit them to your branch.
5. Push your changes to your fork on GitHub.
6. Open a pull request from your branch to the main repository.

Please ensure that your code follows the project's coding style and that all tests pass before submitting a pull request. If you find any bugs or have suggestions for improvements, feel free to open an issue on GitHub.

## License

This project is licensed under the MIT License. See the LICENSE file for the full license text.

Copyright (c) 2023. All rights reserved.
