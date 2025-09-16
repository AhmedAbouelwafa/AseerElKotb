import { Component, OnInit } from '@angular/core';
import { NavCrumb, NavcrumbItem } from '../../../../shared/Components/nav-crumb/nav-crumb';
import { Pagination } from '../../../../shared/Components/pagination/pagination';
import { IAuthor, PaginatedIAuthor } from '../../Author-Model/iauthor';
import { CommonModule } from '@angular/common';
import { AuthorApiService } from '../../../../core/services/Author/author-api-service';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { environment } from '../../../../core/configs/environment.config';

@Component({
  selector: 'app-all-authors',
  imports: [NavCrumb,Pagination,CommonModule,RouterLink,RouterLinkActive],
  templateUrl: './all-authors.html',
  styleUrl: './all-authors.css'
})
export class AllAuthors implements OnInit {

  breadcrumbs: NavcrumbItem[] = [
      { name: 'المؤلفون', path: '/' },
  ];

  authors: PaginatedIAuthor[] = [];
  currentPage = 1;
  pageSize = 28;
  totalPages = 0;
  totalCount = 0;
  search = '';
   


constructor(private authorService: AuthorApiService) {}

  ngOnInit(): void {
    this.loadAuthors();
  }

  loadAuthors(): void {
    this.authorService.getAllAuthorsPaginated(this.currentPage, this.pageSize, this.search)
      .subscribe({
        next: (response) => {
          this.authors = response.data.map(author => ({
            ...author,
            booksCount: author.books.length,
            followersCount: 0, // Will be updated
            QoutationsCount:0 // Will be updated need create service for it

          }));
          console.log(response.data)
          this.currentPage = response.currentPage;
          this.pageSize = response.pageSize;
          this.totalCount = response.totalCount;
          this.totalPages = response.totalPages;
          console.log(response)
          // Fetch follower counts
          this.authors.forEach(author => {
            this.authorService.getAuthorFollowerCount(author.id)
              .subscribe({
                next: (res) => {
                  author.followerCount = res.followerCount;
                },
                
                error: (err) => console.error(`Failed to fetch followers for author ${author.id}`, err)
              });
          });
        },
        error: (err) => console.error('Failed to fetch authors', err)
      });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadAuthors();
  }
  private baseUrl = environment.apiBaseUrl;
  
     getCoverImageUrl(item:PaginatedIAuthor): string {
      if (item.imageUrl.startsWith('/uploads')) {
            return this.baseUrl + item.imageUrl;
          }
        return item.imageUrl;
    }

  // onSearchChange(searchTerm: string): void {
  //   this.search = searchTerm;
  //   this.currentPage = 1;
  //   this.loadAuthors();
  // }

}
