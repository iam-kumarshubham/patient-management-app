export interface Patient {
  id?: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female' | 'Other';
  contactNumber: string;
  email: string;
  address: string;
  createdAt?: string;
  updatedAt?: string;
}
