// @ts-expect-error
import datePlugin from 'compromise-dates';
import nlp from 'compromise';
import numbersPlugin from 'compromise-numbers';

nlp.extend(datePlugin);
nlp.extend(numbersPlugin);

type AnonymizeType = 'date' | 'email' | 'firstName' | 'lastName' | 'money' | 'organization' | 'phoneNumber' | 'times' | 'numbers';

export class AnonymizeNlp {
  private maskMaps: Record<string, Map<string, string>> = {};
  private readonly typesToAnonymize: AnonymizeType[];

  constructor(typesToAnonymize: AnonymizeType[] = ['date', 'email', 'firstName', 'lastName', 'money', 'organization', 'phoneNumber', 'times', 'numbers']) {
    this.typesToAnonymize = typesToAnonymize;
    this.setEmptyMaskMaps();
  }

  public anonymize(input: string): string {
    this.setEmptyMaskMaps();
    let output = input;
    const doc = nlp(input);
    const people = doc.people().out('offset');
    // @ts-expect-error
    const times = doc.times().out('offset');
    // @ts-expect-error
    const dates = doc.dates().out('offset');
    const organizations = doc.organizations().out('offset');
    const money = doc.money().out('offset');
    const phoneNumbers = doc.phoneNumbers().out('offset');
    const emails = doc.emails().out('offset');
    // const numbers = doc.numbers().out('offset');

    const allTypes = [
      { arr: emails, type: 'email' },
      { arr: phoneNumbers, type: 'phoneNumber' },
      { arr: organizations, type: 'organization' },
      { arr: people, tag: 'LastName', type: 'lastName' },
      { arr: people, tag: 'FirstName', type: 'firstName' },
      { arr: times, type: 'times' },
      { arr: dates, type: 'date' },
      { arr: money, type: 'money' },
      // { arr: numbers, type: 'numbers' },
    ];

    const replacements = allTypes
      .filter(({ type }) => this.typesToAnonymize.includes(type as AnonymizeType))
      .flatMap(({ arr, tag, type }) =>
        arr.flatMap((obj: any) => {
          // TODO: Fix this
          if (type === 'date' || !tag) {
            return { ...obj, type };
          }
          return obj.terms.map((term: any) => ({
            ...term,
            type: tag ? (term.tags.includes(tag) ? type : null) : type,
          }));
        }),
      )
      .filter((rep) => Boolean(rep.type));

    replacements.sort((a, b) => a.offset.start - b.offset.start);

    replacements.forEach((rep) => {
      const { text, type } = rep;
      const mask = this.mask(text, type);
      output = output.replace(text, mask);
    });
    return output;
  }

  public deAnonymize(input: string): string {
    let deAnonymizedInput = input;
    this.typesToAnonymize.forEach((type) => {
      this.maskMaps[type].forEach((key: string, value: string) => {
        deAnonymizedInput = deAnonymizedInput.split(key).join(value);
      });
    });
    this.setEmptyMaskMaps();
    return deAnonymizedInput;
  }

  private setEmptyMaskMaps(): void {
    this.typesToAnonymize.forEach((type) => {
      this.maskMaps[type] = new Map<string, string>();
    });
  }

  private mask(text: string, type: string): string {
    if (!this.maskMaps[type].has(text)) {
      const { size } = this.maskMaps[type];
      const maskedValue = `<${type.toUpperCase()}${size > 0 ? size : ''}>`;
      this.maskMaps[type].set(text, maskedValue);
    }

    return this.maskMaps[type].get(text) as string;
  }
}
