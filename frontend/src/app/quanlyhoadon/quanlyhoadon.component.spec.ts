import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuanlyhoadonComponent } from './quanlyhoadon.component';

describe('QuanlyhoadonComponent', () => {
  let component: QuanlyhoadonComponent;
  let fixture: ComponentFixture<QuanlyhoadonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuanlyhoadonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuanlyhoadonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
