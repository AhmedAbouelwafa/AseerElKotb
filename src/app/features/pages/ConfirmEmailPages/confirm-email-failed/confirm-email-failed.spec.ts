import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmEmailFailed } from './confirm-email-failed';

describe('ConfirmEmailFailed', () => {
  let component: ConfirmEmailFailed;
  let fixture: ComponentFixture<ConfirmEmailFailed>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmEmailFailed]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfirmEmailFailed);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
