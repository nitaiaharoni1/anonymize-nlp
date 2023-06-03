// @ts-expect-error
import datePlugin from 'compromise-dates';
import nlp from 'compromise';

nlp.extend(datePlugin);

type AnonymizeType = 'date' | 'email' | 'firstName' | 'lastName' | 'money' | 'organization' | 'phoneNumber' | 'times';

export class AnonymizeNlp {
  private maskMaps: Record<string, Map<string, string>> = {};
  private readonly typesToAnonymize: AnonymizeType[] = [];

  constructor(typesToAnonymize?: AnonymizeType[]) {
    this.typesToAnonymize = typesToAnonymize ?? ['date', 'email', 'firstName', 'lastName', 'money', 'organization', 'phoneNumber', 'times'];
    this.setEmptyMaskMaps();
  }

  private setEmptyMaskMaps(): void {
    this.typesToAnonymize.forEach((type) => {
      this.maskMaps[type] = new Map<string, string>();
    });
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

    const peopleReplacementsArr = people.flatMap((person: any) =>
      person.terms.map((term: any) => ({
        ...term,
        type: term.tags.includes('FirstName') ? 'firstName' : 'lastName',
      })),
    );
    const dateReplacementsArr = dates.map((rep: any) => ({ ...rep, type: 'date' }));
    const organizationReplacementsArr = organizations.map((org: any) => ({ ...org, type: 'organization' }));
    const moneyReplacementsArr = money.map((mony: any) => ({ ...mony, type: 'money' }));
    const phoneNumberReplacementsArr = phoneNumbers.map((phone: any) => ({ ...phone, type: 'phoneNumber' }));
    const emailReplacementsArr = emails.map((email: any) => ({ ...email, type: 'email' }));
    const timesReplacementsArr = times.map((time: any) => ({ ...time, type: 'times' }));

    const replacements = [
      ...peopleReplacementsArr,
      ...dateReplacementsArr,
      ...organizationReplacementsArr,
      ...moneyReplacementsArr,
      ...phoneNumberReplacementsArr,
      ...emailReplacementsArr,
      ...timesReplacementsArr,
    ];
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
    ['firstName', 'lastName', 'date', 'organization', 'money', 'phoneNumber', 'email'].forEach((type) => {
      this.maskMaps[type].forEach((key: string, value: string) => {
        deAnonymizedInput = deAnonymizedInput.split(key).join(value);
      });
    });
    return deAnonymizedInput;
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
