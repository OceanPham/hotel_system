import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListserviceComponent } from './listservice.component';

describe('ListserviceComponent', () => {
  let component: ListserviceComponent;
  let fixture: ComponentFixture<ListserviceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListserviceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListserviceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
