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

  getVisiblePages(): number[] {
    if (this.TotalPages <= 7) {
      // If 7 or fewer pages, show all
      return this.GetPagesNumbers();
    }
    
    // Show first 5 pages + current area
    if (this.CurrentPage <= 4) {
      return [1, 2, 3, 4, 5];
    }
    
    // Show pages around current page
    if (this.CurrentPage > 4 && this.CurrentPage < this.TotalPages - 3) {
      return [
        this.CurrentPage - 2,
        this.CurrentPage - 1,
        this.CurrentPage,
        this.CurrentPage + 1,
        this.CurrentPage + 2
      ];
    }
    
    // Show last 5 pages
    return [
      this.TotalPages - 4,
      this.TotalPages - 3,
      this.TotalPages - 2,
      this.TotalPages - 1,
      this.TotalPages
    ];
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

