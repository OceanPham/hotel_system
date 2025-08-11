import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingpaymentComponent } from './bookingpayment.component';

describe('BookingpaymentComponent', () => {
  let component: BookingpaymentComponent;
  let fixture: ComponentFixture<BookingpaymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingpaymentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookingpaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
