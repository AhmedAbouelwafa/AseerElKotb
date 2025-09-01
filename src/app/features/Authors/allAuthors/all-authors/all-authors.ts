import { Component } from '@angular/core';
import { NavCrumb, NavcrumbItem } from '../../../../shared/Components/nav-crumb/nav-crumb';
import { Pagination } from '../../../../shared/Components/pagination/pagination';
import { IAuthor } from '../../Author-Model/iauthor';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-all-authors',
  imports: [NavCrumb,Pagination,CommonModule],
  templateUrl: './all-authors.html',
  styleUrl: './all-authors.css'
})
export class AllAuthors {
  breadcrumbs: NavcrumbItem[] = [
      { name: 'المؤلفون', path: '/' },
    ];
    stars = Array(5).fill(0); // 5 نجوم

    //https://localhost:7207/api/Authors/GetAll
    authors=[
      {
      id: 1,
      name: "نجيب محفوظ",
      bio: "أديب مصريأديب مصرأديب مصرأديب مصرأديب مصرأديب مصرأديب مصرvأديب مصرأديب مصرأديب مصرأديب مصرأديب مصر",
      imageUrl: "https://th.bing.com/th/id/OIP.RHW6cYvefc-Dm1HFZzxi8gHaEP?w=301&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3",
      rating: 0,
      booksCount: 0,
      followersCount: 0,
    qoutationsCount: 0,
    },

    {
      id: 1,
      name: "نجيب محفوظ",
      bio: "أديب مصرأديب مصرأديب ديب مصرأديب مصرأديب مصرأديب مصرأديب مصر مصرديب مصرأديب مصرأديب مصرأديب مصرأديب مصر مصرديب مصرأديب مصرأديب مصرأديب مصرأديب مصر مصرديب مصرأديب مصرأديب مصرأديب مصرأديب مصر مصرديب مصرأديب مصرأديب مصرأديب مصرأديب مصر مصرديب مصرأديب مصرأديب مصرأديب مصرأديب مصر مصرديب مصرأديب مصرأديب مصرأديب مصرأديب مصر مصرديب مصرأديب مصرأديب مصرأديب مصرأديب مصر مصرمصرأديب مصرأديب مصر مصرأديب",
      imageUrl: "https://th.bing.com/th/id/OIP.RHW6cYvefc-Dm1HFZzxi8gHaEP?w=301&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3",
      rating: 0,
      booksCount: 0,
      followersCount: 0,
    qoutationsCount: 0,
    },
     {
      id: 1,
      name: "نجيب محفوظ",
      bio: "أديب مصريأديب مصرأديب مصرأديب مصرأديب مصرأديب مصرأديب مصرvأديب مصرأديب مصرأديب مصرأديب مصرأديب مصر",
      imageUrl: "https://th.bing.com/th/id/OIP.RHW6cYvefc-Dm1HFZzxi8gHaEP?w=301&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3",
      rating: 0,
      booksCount: 0,
      followersCount: 0,
    qoutationsCount: 0,
    },
     {
      id: 1,
      name: "نجيب محفوظ",
      bio: "أديب مصريأديب مصرأديب مصرأديب مصرأديب مصرأديب مصرأديب مصرvأديب مصرأديب مصرأديب مصرأديب مصرأديب مصر",
      imageUrl: "https://th.bing.com/th/id/OIP.RHW6cYvefc-Dm1HFZzxi8gHaEP?w=301&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3",
      rating: 0,
      booksCount: 0,
      followersCount: 0,
    qoutationsCount: 0,
    },
    ]
}
