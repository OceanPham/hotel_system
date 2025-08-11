import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListbookingComponent } from './listbooking.component';

describe('ListbookingComponent', () => {
  let component: ListbookingComponent;
  let fixture: ComponentFixture<ListbookingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListbookingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListbookingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
