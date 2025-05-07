import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PatientService } from '../../services/patient.service';
import { Patient } from '../../models/patient.model';

@Component({
  selector: 'app-patient-form',
  templateUrl: './patient-form.component.html',
  styleUrls: ['./patient-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatSnackBarModule
  ]
})
export class PatientFormComponent implements OnInit {
  patientForm: FormGroup;
  isEditMode = false;
  patientId: number | null = null;
  genders = ['Male', 'Female', 'Other'];

  constructor(
    private formBuilder: FormBuilder,
    private patientService: PatientService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.patientForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      gender: ['', Validators.required],
      contactNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      email: ['', [Validators.required, Validators.email]],
      address: ['', Validators.required]
    });
  }

  async ngOnInit(): Promise<void> {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const parsedId = parseInt(idParam, 10);
      this.patientId = parsedId;
      this.isEditMode = true;
      try {
        const patient = await this.patientService.getPatient(parsedId);
        if (patient) {
          this.patientForm.patchValue(patient);
        }
      } catch (error) {
        this.showErrorMessage('Failed to load patient data');
      }
    }
  }

  async onSubmit() {
    if (this.patientForm.valid) {
      const patientData = this.patientForm.value;
      try {
        if (this.isEditMode && this.patientId !== null) {
          await this.patientService.updatePatient(this.patientId, patientData);
          this.showSuccessMessage('Patient updated successfully');
        } else {
          await this.patientService.createPatient(patientData);
          this.showSuccessMessage('Patient added successfully');
        }
        this.router.navigate(['/patients']);
      } catch (error) {
        this.showErrorMessage('Error saving patient');
        console.error('Error saving patient:', error);
      }
    }
  }

  private getErrorMessage(controlName: string): string {
    const control = this.patientForm.get(controlName);
    if (control?.hasError('required')) {
      return `${controlName} is required`;
    }
    if (control?.hasError('email')) {
      return 'Invalid email address';
    }
    if (control?.hasError('pattern')) {
      return 'Invalid contact number';
    }
    return '';
  }

  private showSuccessMessage(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }

  private showErrorMessage(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['error-snackbar']
    });
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach((control: AbstractControl) => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}
