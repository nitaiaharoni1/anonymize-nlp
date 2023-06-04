import { AnonymizeType, anonymizeTypeOptions, regexPatterns } from './common/regexPatterns';
import nlp from 'compromise';

interface IDocTerm {
  text: string;
  tag: string;
  start: number;
}

export class AnonymizeNlp {
  private maskMaps: Record<string, Map<string, string>> = {};
  private readonly typesToAnonymize: AnonymizeType[];

  constructor(typesToAnonymize: AnonymizeType[] = anonymizeTypeOptions, typesToExclude: AnonymizeType[] = []) {
    const typesToAnonymizeWithoutExcluded = typesToAnonymize.filter((type) => !typesToExclude.includes(type));
    this.typesToAnonymize = typesToAnonymizeWithoutExcluded;
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
    return [...doc.emails().out('offset'), ...doc.money().out('offset'), ...doc.organizations().out('offset'), ...doc.people().out('offset'), ...doc.phoneNumbers().out('offset')];
  }

  private createDocTermsFromTerms(processedTerms: IDocTerm[], docObject: any, term: any): IDocTerm[] {
    const reversedTags = term.tags.reverse();
    const foundTag = reversedTags.find((tag: string) => this.typesToAnonymize.includes(tag.toLowerCase() as any));
    const { text } = term;
    if (foundTag) {
      processedTerms.push({ start: docObject.offset.start, tag: foundTag, text });
    }
    return processedTerms;
  }

  private createUniqueAndSortedTerms(processedTerms: IDocTerm[]): IDocTerm[] {
    const uniqueProcessedTerms = Array.from(processedTerms.reduce((map, term) => map.set(term.text + term.start + term.tag, term), new Map()).values());
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
    processedTerms = this.processTerms(input, processedTerms);
    processedTerms = this.processWithRegex(input, processedTerms);
    return this.createUniqueAndSortedTerms(processedTerms);
  }

  private processTerms(input: string, processedTerms: IDocTerm[]): IDocTerm[] {
    const doc = nlp(input);
    const processedDoc = this.getTerms(doc);

    processedDoc.forEach((docObject) => {
      const { terms } = docObject;
      terms.forEach((term: any) => {
        processedTerms = this.createDocTermsFromTerms(processedTerms, docObject, term);
      });
    });

    return processedTerms;
  }

  private processWithRegex(input: string, processedTerms: IDocTerm[]): IDocTerm[] {
    const filteredRegexPatterns = regexPatterns.filter((ptrn) => this.typesToAnonymize.includes(ptrn.key as any));
    filteredRegexPatterns.forEach((ptrn) => {
      const { regex, key } = ptrn;
      let match;
      const rx = new RegExp(regex, 'igu');
      while ((match = rx.exec(input)) !== null) {
        processedTerms.push({
          start: match.index,
          tag: key,
          text: match[0],
        });
      }
    });

    return processedTerms;
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
