import { Component, OnInit } from '@angular/core';
import { PublisherServices } from '../../PublisherServices/publisher-services';
import { IPublisher } from '../../Publisher Interfaces/publisher-interfaces';
import { ActivatedRoute, RouterEvent, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FilterBooksRequest } from '../../../products/book-model/Ibook';
import { BookService } from '../../../products/book-service/book-service';
import { BookCard } from '../../../products/card-componenet/book-card/book-card';
import { Pagination } from '../../../../shared/Components/pagination/pagination';

@Component({
  selector: 'app-publisher',
  imports: [BookCard, Pagination, CommonModule,RouterLink,RouterLinkActive],
  templateUrl: './publisher.html',
  styleUrl: './publisher.css'
})
export class Publisher implements OnInit {
  publisher ?:IPublisher
  publisherId:number=1;
  PublisherFollowerCount:number=0;
  BookRelatedToPublisherCount:number=0;
  AuthorsRelatedToPublisherCount:number=0;
  isFollowing: boolean = false;
  userId: number = 5;///////////////////change with authentication

  Books: any[] = [];
  currentPage = 1;
  pageSize = 12;
  totalPages = 1;
  totalCount = 0;


  Authors:any[]=[];
  AuthorcurrentPage = 1;
  AuthorpageSize = 12;
  AuthortotalPages = 1;
  AuthortotalCount = 0;

  constructor(
    private publisherServices:PublisherServices,
    private BookServices:BookService,
    private route: ActivatedRoute)
  {

  }
  ngOnInit(): void {
     this.route.paramMap.subscribe(params => {
      let idParam = params.get('id');
      if(idParam){
        this.publisherId=+idParam;
        this.GetPublisher(this.publisherId)
      }
      this.getBooksPublisherId();
      this. getAuthorsRelatedToPublisher(this.AuthorcurrentPage,this.AuthorpageSize);
  })
}

GetPublisher(id:number){
    this.publisherServices.getPublisherById(id).subscribe({
      next:(response)=>{
        this.publisher=response.data
        this.publisherId=response.data.id

         this.publisherServices.getPublisherFollowerCount(response.data.id).subscribe({
          next:(res)=>{
            this.PublisherFollowerCount=res.data.followerCount;
          },
          error: (err) => {
            console.error('API error:', err);
            console.log("error to fetch data")
          }
        })
         this.isFollow()
      },
      error: (err) => {
        console.error('API error:', err);
        console.log("error to fetch data")
      }

    })

}



isFollow(){
  this.publisherServices.isFollowPublisher(this.userId,this.publisherId).subscribe({
    next:(response)=>{
      this.isFollowing=response.data.isFollow
      console.log(response.data.isFollow)
    },
    error:(err)=>{
     console.error('API error:', err);
     console.log("error to fetch data")
    }
  })
}

toggleFollow(): void {
  if (this.isFollowing) {
    this.publisherServices.unfollowPublisher(this.userId, this.publisherId).subscribe({
      next: (response) => {
        this.isFollowing = false;
        this.PublisherFollowerCount--;  
      },
      error: (err) => {
        console.error('Failed to unfollow', err);
      }
    });
  } else {
    this.publisherServices.followPublisher(this.userId, this.publisherId).subscribe({
      next: (response) => {
        this.isFollowing = true;
        this.PublisherFollowerCount++;
      },
      error: (err) => {
        console.error('Failed to follow', err);
      }
    });
  }
}


getBooksPublisherId(): void {
  const filterRequest: FilterBooksRequest = {
    CategoryIds: [],
    PageNumber: this.currentPage,
    PageSize: this.pageSize,
    SearchTerm:'',
    Language: null,
    PublisherIds:[this.publisherId],
    SortBy: 0
    };

    this.BookServices.filterBooks(filterRequest).subscribe({
      next: (response) => {
        if (response.succeeded) {
          this.Books = response.data;
          this.totalCount = response.totalCount;
          this.totalPages = response.totalPages;
          this.BookRelatedToPublisherCount=this.Books.length;
          console.log(this.Books)
        } else {
          console.error('API returned error:', response.message);
          this.Books = [];
        }
      },
      error: (error) => {
        console.error('Error fetching books:', error);
        this.Books = [];
      }
    });
  }

  
    getAuthorsRelatedToPublisher(pageNumber: number=this.AuthorcurrentPage, pageSize: number =this.AuthorpageSize){
      this.publisherServices.getAuthorRelatedToPublisher(this.publisherId,pageNumber,pageSize).subscribe({
        next:(res)=>{
           if (res.succeeded) {
            this.Authors=res.data
            this.AuthortotalCount = res.totalCount;
            this.AuthortotalPages = res.totalPages;
            this.AuthorsRelatedToPublisherCount=res.data.length;
           }
           console.log(res.data)
        },
      error: (error) => {
        console.error('Error fetching books:', error);
        this.Books = [];
      }
      })
    }
/////////////////For pagination/////////////////////
GetNewPage(page: number): void {
  this.currentPage = page;
  this.getBooksPublisherId();
}
GetNewPageAuthor(page: number): void {
  this.AuthorcurrentPage = page;
  this. getAuthorsRelatedToPublisher(this.AuthorcurrentPage,this.AuthorpageSize);
}


private baseUrl = 'https://localhost:7207'////////chaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaange
        
  getCoverImageUrl(logoUrl: string | null): string | null {
    if (!logoUrl) return null;
        
    if (logoUrl.startsWith('/uploads')) {
      return this.baseUrl + logoUrl;
    }  
    return logoUrl;
  }


  ////////////////////////For Hiden ////////////////////////////
  activeSection: 'books' | 'authors' = 'books';
   // Add these methods to handle section switching
  showBooks(): void {
    this.activeSection = 'books';
  }

  showAuthors(): void {
    this.activeSection = 'authors';
  }
}
