import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Patient } from '../../models/patient.model';
import { PatientService } from '../../services/patient.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  templateUrl: './patient-list.component.html',
  styleUrl: './patient-list.component.scss'
})
export class PatientListComponent implements OnInit {
  displayedColumns: string[] = [
    'firstName',
    'lastName',
    'dateOfBirth',
    'gender',
    'contactNumber',
    'email',
    'actions'
  ];
  dataSource: MatTableDataSource<Patient>;
  isLoading = true;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private patientService: PatientService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.dataSource = new MatTableDataSource<Patient>();
  }

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients(): void {
    this.isLoading = true;
    this.patientService.getPatients().subscribe({
      next: (patients) => {
        this.dataSource.data = patients;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading patients:', error);
        this.isLoading = false;
      }
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  editPatient(patient: Patient): void {
    // TODO: Implement edit functionality
    console.log('Edit patient:', patient);
  }

  deletePatient(patient: Patient): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Patient',
        message: `Are you sure you want to delete ${patient.firstName} ${patient.lastName}?`,
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.patientService.deletePatient(patient.id!).then(() => {
          this.snackBar.open('Patient deleted successfully', 'Close', { duration: 3000 });
          this.loadPatients();
        }).catch(error => {
          console.error('Error deleting patient:', error);
          this.snackBar.open('Error deleting patient', 'Close', { duration: 3000 });
        });
      }
    });
  }
}
