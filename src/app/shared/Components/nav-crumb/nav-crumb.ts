import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-nav-crumb',
  imports: [CommonModule,RouterModule],
  templateUrl: './nav-crumb.html',
  styleUrl: './nav-crumb.css'
})
export class NavCrumb {
   @Input() Navcrumbs: NavcrumbItem[] = [];
}
export interface NavcrumbItem {
  name: string;
  path?: string; 
}
