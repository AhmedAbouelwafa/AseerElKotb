import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AICHATBOT } from './ai-chatbot';

describe('AICHATBOT', () => {
  let component: AICHATBOT;
  let fixture: ComponentFixture<AICHATBOT>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AICHATBOT]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AICHATBOT);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
