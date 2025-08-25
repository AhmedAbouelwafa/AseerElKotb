import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserReply } from './user-reply';

describe('UserReply', () => {
  let component: UserReply;
  let fixture: ComponentFixture<UserReply>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserReply]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserReply);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
