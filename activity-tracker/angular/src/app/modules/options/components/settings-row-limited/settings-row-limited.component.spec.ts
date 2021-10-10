import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsRowLimitedComponent } from './settings-row-limited.component';

describe('SettingsRowLimitedComponent', () => {
  let component: SettingsRowLimitedComponent;
  let fixture: ComponentFixture<SettingsRowLimitedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SettingsRowLimitedComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsRowLimitedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
