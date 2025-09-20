import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { NavCrumb, NavcrumbItem } from '../../shared/Components/nav-crumb/nav-crumb';
import { Auth } from '../../services/auth';
import { UpdateProfileRequest, GetProfileResponse, Gender } from '../../models/profile-interfaces';
import { TranslateService } from '@ngx-translate/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-account-settings',
  imports: [CommonModule, ReactiveFormsModule, NavCrumb , TranslateModule],
  templateUrl: './account-settings.html',
  styleUrl: './account-settings.css'
})
export class AccountSettings implements OnInit {
  protected readonly auth = inject(Auth);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);

  // Signals
  protected readonly isLoading = signal(false);
  protected readonly isSaving = signal(false);
  protected readonly successMessage = signal('');
  protected readonly errorMessage = signal('');
  protected readonly profileData = signal<GetProfileResponse | null>(null);

  // Gender enum for template
  readonly Gender = Gender;

  // Form
  protected readonly profileForm: FormGroup = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
    lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
    bio: ['', [Validators.maxLength(500)]],
    nationality: ['', [Validators.maxLength(100)]],
    dateOfBirth: [''],
    gender: [null]
  });

  // Breadcrumbs
  protected readonly breadcrumbs: NavcrumbItem[] = [];

  // Computed properties for form validation
  protected readonly firstNameError = computed(() => {
    const control = this.profileForm.get('firstName');
    if (control?.errors && control.touched) {
      if (control.errors['required']) return this.translate.instant('accountSettings.FIRST_NAME') + ' مطلوب';
      if (control.errors['minlength']) return 'يجب أن يكون ' + this.translate.instant('accountSettings.FIRST_NAME') + ' حرفين على الأقل';
      if (control.errors['maxlength']) return 'لا يمكن أن يتجاوز ' + this.translate.instant('accountSettings.FIRST_NAME') + ' 50 حرفاً';
    }
    return '';
  });

  protected readonly lastNameError = computed(() => {
    const control = this.profileForm.get('lastName');
    if (control?.errors && control.touched) {
      if (control.errors['required']) return this.translate.instant('accountSettings.LAST_NAME') + ' مطلوب';
      if (control.errors['minlength']) return 'يجب أن يكون ' + this.translate.instant('accountSettings.LAST_NAME') + ' حرفين على الأقل';
      if (control.errors['maxlength']) return 'لا يمكن أن يتجاوز ' + this.translate.instant('accountSettings.LAST_NAME') + ' 50 حرفاً';
    }
    return '';
  });

  protected readonly bioError = computed(() => {
    const control = this.profileForm.get('bio');
    if (control?.errors && control.touched) {
      if (control.errors['maxlength']) return 'لا يمكن أن تتجاوز ' + this.translate.instant('accountSettings.BIO') + ' 500 حرف';
    }
    return '';
  });

  protected readonly nationalityError = computed(() => {
    const control = this.profileForm.get('nationality');
    if (control?.errors && control.touched) {
      if (control.errors['maxlength']) return 'لا يمكن أن تتجاوز ' + this.translate.instant('accountSettings.NATIONALITY') + ' 100 حرف';
    }
    return '';
  });

  ngOnInit(): void {
    this.setupBreadcrumbs();
    this.loadProfile();
  }

  private setupBreadcrumbs(): void {
    this.breadcrumbs.length = 0; // Clear existing breadcrumbs
    this.breadcrumbs.push(
      { name: this.translate.instant('userProfile.HOME'), path: '/' },
      { name: this.translate.instant('userProfile.USER_PROFILE'), path: '/user-profile' },
      { name: this.translate.instant('accountSettings.ACCOUNT_SETTINGS'), path: '/account-settings' }
    );
  }

  private loadProfile(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    // Check if user is authenticated first
    const currentUser = this.auth.user();
    console.log('Current user from auth service:', currentUser);

    // Check if token is valid
    if (!this.auth.isTokenValid()) {
      console.error('Token is invalid or expired');
      this.isLoading.set(false);
      this.errorMessage.set(this.translate.instant('auth.SESSION_EXPIRED'));
      this.auth.logout();
      this.router.navigate(['/login']);
      return;
    }

    if (!currentUser || !currentUser.token) {
      console.error('User not authenticated or no token found');
      this.isLoading.set(false);
      this.errorMessage.set(this.translate.instant('auth.LOGIN_REQUIRED'));
      this.router.navigate(['/login']);
      return;
    }

    console.log('Starting profile load request...');
    this.auth.getProfile().subscribe({
      next: (result) => {
        console.log('Profile load result:', result);
        this.isLoading.set(false);
        if (result.success && result.data) {
          console.log('Profile data received:', result.data);
          this.profileData.set(result.data);
          this.populateForm(result.data);
        } else {
          console.error('Profile load failed:', result.message);
          this.errorMessage.set(result.message || 'فشل في تحميل بيانات الملف الشخصي');
        }
      },
      error: (error) => {
        console.error('Profile load error:', error);
        this.isLoading.set(false);

        // Handle specific error cases
        if (error.status === 401) {
          this.errorMessage.set('انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى');
          this.auth.logout();
          this.router.navigate(['/login']);
        } else if (error.status === 403) {
          this.errorMessage.set('ليس لديك صلاحية للوصول إلى هذه الصفحة');
        } else {
          this.errorMessage.set('حدث خطأ أثناء تحميل بيانات الملف الشخصي');
        }
      }
    });
  }

  private populateForm(data: GetProfileResponse): void {
    this.profileForm.patchValue({
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      bio: data.bio || '',
      nationality: data.nationality || '',
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth).toISOString().split('T')[0] : '',
      gender: data.gender !== null && data.gender !== undefined ? data.gender : null
    });

    // Log profile data for debugging
    console.log('Profile data loaded:', data);
    console.log('Form populated with:', this.profileForm.value);
  }

  protected onSubmit(): void {
    if (this.profileForm.invalid || this.isSaving()) {
      this.markFormGroupTouched();
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const formValue = this.profileForm.value;

    const updateData: UpdateProfileRequest = {
      firstName: formValue.firstName?.trim(),
      lastName: formValue.lastName?.trim(),
      bio: formValue.bio?.trim() || null,
      nationality: formValue.nationality?.trim() || null,
      dateOfBirth: formValue.dateOfBirth ? new Date(formValue.dateOfBirth) : null,
      gender: formValue.gender !== null ? formValue.gender : null
    };

    this.auth.updateProfile(updateData).subscribe({
      next: (result) => {
        this.isSaving.set(false);
        if (result.success) {
          this.successMessage.set(result.message || 'تم تحديث الملف الشخصي بنجاح');
          this.errorMessage.set('');

          // Clear any error messages after successful update
          this.errorMessage.set('');

          // Reload profile data to get updated information
          setTimeout(() => {
            this.loadProfile();
          }, 1000);
        } else {
          this.errorMessage.set(result.message || 'فشل في تحديث الملف الشخصي');
          this.successMessage.set('');
        }
      },
      error: (error) => {
        this.isSaving.set(false);
        this.errorMessage.set('حدث خطأ أثناء تحديث الملف الشخصي');
        this.successMessage.set('');
        console.error('Error updating profile:', error);
      }
    });
  }

  protected onCancel(): void {
    if (this.profileData()) {
      this.populateForm(this.profileData()!);
      this.errorMessage.set('');
      this.successMessage.set('');
    } else {
      this.router.navigate(['/user-profile']);
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.profileForm.controls).forEach(key => {
      const control = this.profileForm.get(key);
      control?.markAsTouched();
    });
  }

  protected onInputFocus(event: FocusEvent, fieldType: string): void {
    const input = event.target as HTMLInputElement;
    if (fieldType === 'firstName' || fieldType === 'lastName' || fieldType === 'bio' || fieldType === 'nationality') {
      input.style.direction = 'rtl';
      input.style.textAlign = 'right';
    }
  }

  protected onInputChange(event: Event, fieldType: string): void {
    const input = event.target as HTMLInputElement;
    if (fieldType === 'firstName' || fieldType === 'lastName' || fieldType === 'bio' || fieldType === 'nationality') {
      input.style.direction = 'rtl';
      input.style.textAlign = 'right';
    }
  }
}
