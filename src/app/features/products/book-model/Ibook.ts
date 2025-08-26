import { bookLang } from "./bookLang";
export interface Ibook{
  id : number,
  title : string,
  description : string,
  isbn : string,
  price : number,
  discountPercentage : number,
  publishedDate : Date,
  pageCount : number,

  language : bookLang,
  
  coverImageUrl : string,
  format : string,
  stockQuantity : number,
  authorId : number,
  authorName : string,
  publisherId : number,
  publisherName : string,
  categoryIds : number[],
  categoryNames : string[],
  isActive : boolean,
  rating : number,


}


export interface FilterBooksRequest {
  CategoryIds: number[];
  PageNumber: number;
  PageSize: number;
  SearchTerm?: string;
  Language?: number|null;
  PublisherIds?: number[];
  SortBy?: number;
}

export interface BookFilterResponse {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  message: string | null;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  data: any[];
}
