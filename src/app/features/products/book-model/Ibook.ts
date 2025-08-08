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
