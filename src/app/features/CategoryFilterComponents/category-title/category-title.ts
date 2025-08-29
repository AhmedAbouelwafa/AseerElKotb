import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-category-title',
  imports: [],
  templateUrl: './category-title.html',
  styleUrl: './category-title.css'
})
export class CategoryTitle {
  @Input() categoryName: string = '  ';
  @Input() categoryDescription: string = ' ';

}
