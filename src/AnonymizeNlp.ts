import { uniqBy } from 'lodash';
// @ts-expect-error
import datePlugin from 'compromise-dates';
import nlp from 'compromise';
import numbersPlugin from 'compromise-numbers';

nlp.extend(datePlugin);
nlp.extend(numbersPlugin);

interface IDocTerm {
  text: string;
  tag: string;
  start: number;
}

type AnonymizeType = 'date' | 'email' | 'firstname' | 'lastname' | 'money' | 'organization' | 'phonenumber' | 'time' | 'numbers';

export class AnonymizeNlp {
  private maskMaps: Record<string, Map<string, string>> = {};
  private readonly typesToAnonymize: AnonymizeType[];

  constructor(typesToAnonymize: AnonymizeType[] = ['date', 'email', 'firstname', 'lastname', 'money', 'organization', 'phonenumber', 'time', 'numbers']) {
    this.typesToAnonymize = typesToAnonymize;
    this.setEmptyMaskMaps();
  }

  public anonymize(input: string): string {
    this.setEmptyMaskMaps();
    let output = input;
    const docTerms = this.processDoc(input);
    output = this.replaceWithMasks(docTerms, output);
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

  private replaceWithMasks(docTerms: IDocTerm[], output: string): string {
    let outputRes = output;
    docTerms.forEach((term) => {
      const { text, tag } = term;
      const mask = this.mask(text, tag);
      outputRes = outputRes.replace(text, mask);
    });
    return outputRes;
  }

  private getTerms(doc: any): any[] {
    return [
      ...doc.dates().out('offset'),
      ...doc.emails().out('offset'),
      ...doc.money().out('offset'),
      ...doc.organizations().out('offset'),
      ...doc.people().out('offset'),
      ...doc.phoneNumbers().out('offset'),
      ...doc.times().out('offset'),
    ];
  }

  private createDocTermsFromTerms(processedTerms: IDocTerm[], docObject: any, term: any): IDocTerm[] {
    const reversedTags = term.tags.reverse();
    const foundTag = reversedTags.find((tag: string) => this.typesToAnonymize.includes(tag.toLowerCase() as any));
    let { text } = term;
    if (foundTag === 'Date') {
      processedTerms.push({ start: docObject.offset.start, tag: 'Date', text: docObject.text });
      // eslint-disable-next-line prefer-destructuring
      text = docObject.text;
    }
    if (foundTag === 'Time') {
      processedTerms.push({ start: docObject.offset.start, tag: 'Time', text: docObject.text });
      // eslint-disable-next-line prefer-destructuring
      text = docObject.text;
    }
    if (foundTag) {
      processedTerms.push({ start: docObject.offset.start, tag: foundTag, text });
    }
    return processedTerms;
  }

  private createUniqueAndSortedTerms(processedTerms: IDocTerm[]): IDocTerm[] {
    const uniqueProcessedTerms = uniqBy(processedTerms, (term) => term.text + term.start + term.tag);
    const sortedProcessedDocTerms = uniqueProcessedTerms.sort((a, b) => {
      const startDiff = a.start - b.start;
      if (startDiff !== 0) {
        return startDiff;
      }
      return b.text.length - a.text.length;
    });
    return sortedProcessedDocTerms;
  }

  private processDoc(input: string): IDocTerm[] {
    let processedTerms: IDocTerm[] = [];
    const doc = nlp(input);
    const processedDoc = this.getTerms(doc);

    processedDoc.forEach((docObject) => {
      const { terms } = docObject;
      terms.forEach((term: any) => {
        processedTerms = this.createDocTermsFromTerms(processedTerms, docObject, term);
      });
    });

    return this.createUniqueAndSortedTerms(processedTerms);
  }

  private setEmptyMaskMaps(): void {
    this.typesToAnonymize.forEach((type) => {
      this.maskMaps[type] = new Map<string, string>();
    });
  }

  private mask(text: string, tag: string): string {
    const lowerCaseTag = tag.toLowerCase();
    if (!this.maskMaps[lowerCaseTag]) {
      this.maskMaps[lowerCaseTag] = new Map<string, string>();
    }
    const { size } = this.maskMaps[lowerCaseTag];
    const maskedValue = `<${tag.toUpperCase()}${size > 0 ? size : ''}>`;
    this.maskMaps[lowerCaseTag].set(text, maskedValue);

    return this.maskMaps[lowerCaseTag].get(text) as string;
  }
}
