import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-search',
  imports: [CommonModule],
  templateUrl: './search.html',
  styleUrl: './search.css'
})
export class Search {
  @Input() placeholderSize: string = '0.8rem';
  @Input() inputWidth: string = '400px';
}
