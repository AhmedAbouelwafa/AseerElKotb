import { CurrencyPipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'customCurrencyPipe',
  standalone: true  
})
export class CustomCurrencyPipePipe implements PipeTransform {

constructor(private currencyPipe: CurrencyPipe) {}

  transform(value: number | null | undefined, currencyCode: string = 'USD'): string {
    if (value == null) {
      return '';
    }

    // Format the value using CurrencyPipe
    const formatted = this.currencyPipe.transform(value, currencyCode, 'symbol');

    // If formatting fails, return an empty string
    if (!formatted) {
      return '';
    }
    return formatted.replace(/(\D+)([\d,.]+)/, '$1 $2 ');
  }

}
