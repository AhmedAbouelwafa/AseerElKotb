import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-filtering',
  imports: [RouterLink,RouterLinkActive,CommonModule , TranslateModule],
  templateUrl: './filtering.html',
  styleUrl: './filtering.css'
})
export class Filtering {
    languages:string[]=['الكتب العربية','الكتب الانجلزية']
  // orders:string[]=['⇡ الأكثر رواجاً',' ⇣ الأقدم',' ⇡ الأحدث']
  publishers:string[]=['الرواق للنشر والتوزيع','كلمات للنشر والتوزيع','دار زين ','دارك للنشر والتوزيع']


  sectionVisibility = {
  language: true,
  order: true,
  publisher: true
};

// Toggle section visibility
toggleSection(section: 'language' | 'order' | 'publisher') {
  this.sectionVisibility[section] = !this.sectionVisibility[section];
}
}
