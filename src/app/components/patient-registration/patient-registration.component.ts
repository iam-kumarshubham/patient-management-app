import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { Patient } from '../../models/patient.model';
import { PatientService } from '../../services/patient.service';

@Component({
  selector: 'app-patient-registration',
  templateUrl: './patient-registration.component.html',
  styleUrls: ['./patient-registration.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule
  ]
})
export class PatientRegistrationComponent implements OnInit {
  patientForm: FormGroup;
  genders = ['Male', 'Female', 'Other'];

  constructor(
    private fb: FormBuilder,
    private patientService: PatientService,
    private snackBar: MatSnackBar
  ) {
    this.patientForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      dateOfBirth: ['', [Validators.required]],
      gender: ['', [Validators.required]],
      contactNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      email: ['', [Validators.required, Validators.email]],
      address: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {}

  async onSubmit() {
    if (this.patientForm.valid) {
      try {
        const patient: Patient = this.patientForm.value;
        await this.patientService.addPatient(patient);
        this.snackBar.open('Patient registered successfully', 'Close', {
          duration: 3000
        });
        this.patientForm.reset();
      } catch (error) {
        this.snackBar.open('Error registering patient', 'Close', {
          duration: 3000
        });
        console.error('Error registering patient:', error);
      }
    }
  }
}
