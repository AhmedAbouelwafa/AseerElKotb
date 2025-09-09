import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NavCrumb } from "../../shared/Components/nav-crumb/nav-crumb";

@Component({
  selector: 'app-user-profile',
  imports: [CommonModule, NavCrumb],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.css'
})
export class UserProfile {
  constructor(private router: Router) {}
  user = {
    name: 'Ahmed Abouelwafa',
    lastSeen: 'منذ 4 ثواني',
    isOnline: true,
    profileImage: 'assets/profile-avatar.png'
  };

  stats = [
    { label: 'النشاطات', value: 3, icon: '📊', isActive: true },
    { label: 'طلباتي', value: 0, icon: '📦', isActive: false, routerLink: '/orders' },
    { label: 'ترشيحاتي', value: 1, icon: '🎯', isActive: false },
    { label: 'مراجعاتي', value: 1, icon: '⭐', isActive: false },
    { label: 'اقتباساتي', value: 1, icon: '💬', isActive: false },
    { label: 'يتابعوني', value: 2, icon: '👥', isActive: false },
    { label: 'أتابعهم', value: 0, icon: '👤', isActive: false }
  ];
  breadcrumbs = [
    { name: 'الرئيسية', path: '/' },
    { name: 'الملف الشخصي', path: '/user-profile' }
  ];

  onStatClick(stat: any) {
    // If stat has a routerLink, navigate to it
    if (stat.routerLink) {
      this.router.navigate([stat.routerLink]);
      return;
    }
    
    // Reset all stats
    this.stats.forEach(s => s.isActive = false);
    // Set clicked stat as active
    stat.isActive = true;
  }
}
