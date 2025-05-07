import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Patient } from '../../models/patient.model';
import { PatientService } from '../../services/patient.service';

@Component({
  selector: 'app-patient-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatSnackBarModule
  ],
  templateUrl: './patient-form.component.html',
  styleUrl: './patient-form.component.scss'
})
export class PatientFormComponent implements OnInit {
  patientForm: FormGroup;
  isEditMode = false;
  patientId: string | null = null;
  genderOptions = ['Male', 'Female', 'Other'];

  constructor(
    private fb: FormBuilder,
    private patientService: PatientService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.patientForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      dateOfBirth: [null, [Validators.required]],
      gender: ['', [Validators.required]],
      contactNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      email: ['', [Validators.required, Validators.email]],
      address: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.patientId = params['id'];
        this.loadPatientData();
      }
    });
  }

  loadPatientData(): void {
    if (this.patientId) {
      this.patientService.getPatient(this.patientId).subscribe({
        next: (patient: Patient | undefined) => {
          if (patient) {
            this.patientForm.patchValue({
              ...patient,
              dateOfBirth: new Date(patient.dateOfBirth)
            });
          }
        },
        error: (error: Error) => {
          console.error('Error loading patient:', error);
          this.snackBar.open('Error loading patient data', 'Close', { duration: 3000 });
        }
      });
    }
  }

  onSubmit(): void {
    if (this.patientForm.valid) {
      const patientData = {
        ...this.patientForm.value,
        dateOfBirth: this.patientForm.value.dateOfBirth.toISOString().split('T')[0]
      };

      const savePatient = async () => {
        try {
          if (this.isEditMode && this.patientId) {
            await this.patientService.updatePatient(this.patientId, patientData);
          } else {
            await this.patientService.createPatient(patientData);
          }
          const message = this.isEditMode ? 'Patient updated successfully' : 'Patient created successfully';
          this.snackBar.open(message, 'Close', { duration: 3000 });
          this.router.navigate(['/patients']);
        } catch (error) {
          console.error('Error saving patient:', error);
          this.snackBar.open('Error saving patient data', 'Close', { duration: 3000 });
        }
      };

      savePatient();
    } else {
      this.markFormGroupTouched(this.patientForm);
    }
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
