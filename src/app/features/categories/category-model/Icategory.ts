export interface Icategory{
  Id : number,
  Name : string,
  Description : string,
  ParentCategoryId : number,
  IsActive : boolean
}

export interface parentCategory{
  Id : number,
  Name : string,
  IsActive : boolean,
  SubCategoriesCount: number
}
