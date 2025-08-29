import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmEmailSuccess } from './confirm-email-success';

describe('ConfirmEmailSuccess', () => {
  let component: ConfirmEmailSuccess;
  let fixture: ComponentFixture<ConfirmEmailSuccess>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmEmailSuccess]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfirmEmailSuccess);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
