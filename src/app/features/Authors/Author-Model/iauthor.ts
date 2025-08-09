export interface IAuthor {
    id: number;
    name: string;
    bio: string;
    imageUrl: string;
    rating: number;
    countryCode: string;
    
        books: {
        id: number;
        title: string;
        price: number;
        discountedPrice: number;
        coverImageUrl: string;
        
    rating: number;}[];
        reviews: {
        id: number;
        reviewerName: string;
        reviewerImage: string;
        rating: number;
        comment: string;
        date: string;
    }[];
    followers: {
        id: number;
        name: string;
        profileImage: string;
        profileUrl: string;
    }[];
}
