import { TestBed } from '@angular/core/testing';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { CustomCurrencyPipePipe } from './custom-currency-pipe-pipe';

describe('CustomCurrencyPipePipe', () => {
  let pipe: CustomCurrencyPipePipe;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CommonModule], // Provides CurrencyPipe
      providers: [CurrencyPipe, CustomCurrencyPipePipe], // Explicitly provide the pipe and CurrencyPipe
    });

    pipe = TestBed.inject(CustomCurrencyPipePipe); // Inject the pipe with dependencies
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });
});