import { bookType } from "./booktType";

export interface Ibook{
  Id : number,
  Title : string,
  Description : string,
  ISBN : string,
  Price : number,
  DiscountPercentage : number,
  CoverImageUrl : string,
  PageCount : number,
  PublishDate : string,
  Language : string,
  Format : string,
  StockQuantity : number,
  IsActive : boolean,
  ViewCount : number,
  SalesCount : number,
  AutherId : number,
  PublisherId : number,
  CategoryId : number
  bookType : bookType,
  Rating? : number
}
