import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-footer',
  imports: [CommonModule, TranslateModule],
  templateUrl: './footer.html',
  styleUrl: './footer.css'
})
export class Footer {
 /**
  *
  */
 constructor(private translate: TranslateService) {


 }
}
