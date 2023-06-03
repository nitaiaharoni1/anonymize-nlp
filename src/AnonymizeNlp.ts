// @ts-expect-error
import datePlugin from 'compromise-dates';
import nlp from 'compromise';

nlp.extend(datePlugin);

type MaskType = 'firstName' | 'lastName' | 'date' | 'organization' | 'money' | 'phoneNumber' | 'email' | 'time';

export class AnonymizeNlp {
  private maskMaps: Record<string, Record<string, string>> = {};
  private readonly types: MaskType[];

  constructor(private readonly typesToMask: MaskType[] | 'all' = 'all') {
    if (typesToMask === 'all') {
      this.types = ['firstName', 'lastName', 'date', 'organization', 'money', 'phoneNumber', 'email', 'time'];
    } else {
      this.types = typesToMask;
    }
    this.setEmptyMaskMaps();
  }

  private setEmptyMaskMaps(): void {
    this.maskMaps = {};
    for (const type of this.types) {
      this.maskMaps[type] = {};
    }
  }

  public anonymize(input: string): string {
    this.setEmptyMaskMaps();
    let output = input;
    const doc = nlp(input);
    const replacements: any[] = [];

    for (const type of this.types) {
      let terms: any;

      switch (type) {
        case 'firstName':
        case 'lastName':
          terms = doc.people().out('offset');
          break;
        case 'date':
          // @ts-expect-error
          terms = doc.dates().out('offset');
          break;
        case 'organization':
          terms = doc.organizations().out('offset');
          break;
        case 'money':
          terms = doc.money().out('offset');
          break;
        case 'phoneNumber':
          terms = doc.phoneNumbers().out('offset');
          break;
        case 'email':
          terms = doc.emails().out('offset');
          break;
        case 'time':
          // @ts-expect-error
          terms = doc.times().out('offset');
          break;
        default:
          throw new Error(`Unknown type: ${type}`);
      }

      const termsReplacementsArr = terms.map((term: any) => ({ ...term, type }));
      replacements.push(...termsReplacementsArr);
    }

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
    this.types.forEach((type) => {
      for (const key in this.maskMaps[type]) {
        deAnonymizedInput = deAnonymizedInput.split(this.maskMaps[type][key]).join(key);
      }
    });
    this.setEmptyMaskMaps();
    return deAnonymizedInput;
  }

  private mask(text: string, type: MaskType): string {
    if (!this.maskMaps[type][text]) {
      const size = Object.keys(this.maskMaps[type]).length;
      const maskedValue = `<${type.toUpperCase()}${size > 0 ? size : ''}>`;
      this.maskMaps[type][text] = maskedValue;
    }

    return this.maskMaps[type][text];
  }
}
