import {Injectable} from '@angular/core';
import {FormGroup, ValidatorFn} from '@angular/forms';

@Injectable({providedIn: 'root'})
export class ValidPeriodDate {
  public validateDateRange(): ValidatorFn {
    return (formGroup: FormGroup) => {
      const startDateControl = formGroup.get('startDate');
      const endDateControl = formGroup.get('endDate');

      if (!startDateControl?.value || !endDateControl?.value) {
        return null;
      }

      if (startDateControl.value.localeCompare(endDateControl.value) > 0) {
        return {
          rangeDateValid: true
        }
      }
    };
  }
}
