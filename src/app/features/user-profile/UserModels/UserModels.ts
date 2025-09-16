export interface ProfileResponse
{
    Id : number;
    FirstName : string;
    LastName : string;
    ImageUrl : string;
    RegistrationPeriod : string;
    Reviews : ReviewDto[];
    Quotes : QuoteDto[];
    Following : UserFollowDto[];
}


export interface ReviewDto
{
  Id : number;
  ReviewFor : ReviewFor;
}

export enum ReviewFor
{
  Book,
  Author,
}


export interface QuoteDto
{
  Id : number;
  QuoteFor : QuoteFor;
}

export enum QuoteFor
{
  Book,
  Author,
}


export interface UserFollowDto
{
  Id : number;
  FollowType : FollowType;
}


export enum FollowType
{
  Author,
  Publisher
}
