import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  imports: [],
  templateUrl: './pagination.html',
  styleUrl: './pagination.css'
})
export class Pagination {
  @Input()CurrentPage: number = 1;
  @Input()TotalPages: number = 1;
  @Output()PageChanged:EventEmitter<number> ; 
 

  constructor(){
    this.PageChanged = new EventEmitter<number>();
  }

  GetPagesNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.TotalPages; i++) {
      pages.push(i);
    }
    return pages;
  }
  GoToPage(page: number): void {
    if (page !== this.CurrentPage && page > 0 && page <= this.TotalPages) {
      this.CurrentPage = page;
      this.PageChanged.emit(this.CurrentPage);
    }
  }
}

