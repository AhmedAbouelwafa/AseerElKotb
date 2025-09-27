import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
  name: 'egyCurrency',
  standalone: true
})
export class EgyCurrencyPipe implements PipeTransform {
  constructor(private translate: TranslateService) {}

  transform(value: number | undefined): string | undefined {
    if (value === undefined) {
      return undefined;
    }
    
    const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    const formattedNumber = value.toFixed(2);
    
    // If language is Arabic, convert to Arabic numerals
    if (this.translate.currentLang === 'ar') {
      return formattedNumber.replace(/[0-9]/g, d => arabicNumbers[+d]) + ' ج.م';
    }
    
    // For English, use standard format with EGP
    return `EGP ${formattedNumber}`;
  }
}
