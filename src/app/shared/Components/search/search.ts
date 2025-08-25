import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule , TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-search',
  imports: [CommonModule , TranslateModule],
  templateUrl: './search.html',
  styleUrl: './search.css'
})
export class Search {
  @Input() placeholderSize: string = '0.8rem';
  @Input() inputWidth: string = '400px';
  @Input() title : string = '';


 
}
