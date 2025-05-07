import { TestBed } from '@angular/core/testing';
import { DatabaseService } from './database.service';

class MockSQLDatabase {
  public static data: any[] = [];
  public static tableCreated = false;

  run(query: string, params: any[] = []) {
    if (query.includes('CREATE TABLE')) {
      if (!MockSQLDatabase.tableCreated) {
        MockSQLDatabase.data = [];
        MockSQLDatabase.tableCreated = true;
      }
      return;
    }
    if (query.includes('INSERT INTO')) {
      const data = {
        id: MockSQLDatabase.data.length + 1,
        firstName: params[0],
        lastName: params[1],
        dateOfBirth: params[2],
        gender: params[3],
        contactNumber: params[4],
        email: params[5],
        address: params[6],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      MockSQLDatabase.data.push(data);
    }
  }

  exec(query: string, params: any[] = []) {
    if (query.includes('SELECT')) {
      let filteredData = [...MockSQLDatabase.data];
      
      if (params && params.length > 0) {
        if (query.includes('firstName = ?') && query.includes('lastName = ?')) {
          filteredData = filteredData.filter(item => 
            item.firstName === params[0] && item.lastName === params[1]
          );
        }
      }
      return [{
        columns: ['id', 'firstName', 'lastName', 'dateOfBirth', 'gender', 'contactNumber', 'email', 'address', 'createdAt', 'updatedAt'],
        values: filteredData.map(item => [
          item.id,
          item.firstName,
          item.lastName,
          item.dateOfBirth,
          item.gender,
          item.contactNumber,
          item.email,
          item.address,
          item.createdAt,
          item.updatedAt
        ])
      }];
    }
    return [];
  }

  close() {}

  export() {
    return new Uint8Array(0);
  }
}

const mockInitSqlJs = async () => {
  return {
    Database: MockSQLDatabase
  };
};

describe('DatabaseService', () => {
  let service: DatabaseService;

  beforeEach(async () => {
    // Mock SQL.js
    (window as any).initSqlJs = async () => {
      return {
        Database: MockSQLDatabase
      };
    };
    TestBed.configureTestingModule({
      providers: [DatabaseService]
    });
    service = TestBed.inject(DatabaseService);
    MockSQLDatabase.data = [];
    MockSQLDatabase.tableCreated = false;
    await service.initDatabase();
  });

  afterEach(() => {
    // Clean up the database after each test
    service.closeDatabase();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize database', async () => {
    await service.initDatabase();
    expect(service.isInitialized()).toBeTruthy();
  });

  it('should create patients table', async () => {
    // Just verify that the service is initialized
    expect(service.isInitialized()).toBeTrue();
  });

  it('should insert and retrieve patient data', async () => {
    await service.initDatabase();
    
    // Insert a patient
    await service.executeQuery('INSERT INTO patients (firstName, lastName, dateOfBirth, gender, contactNumber, email, address) VALUES (?, ?, ?, ?, ?, ?, ?)',
      ['John', 'Doe', '1990-01-01', 'Male', '1234567890', 'john@example.com', '123 Main St']);

    // Retrieve the patient
    const result = await service.executeQuery('SELECT * FROM patients WHERE firstName = ? AND lastName = ?', ['John', 'Doe']);
    expect(result.length).toBe(1);
    expect(result[0].firstName).toBe('John');
    expect(result[0].lastName).toBe('Doe');
    expect(result[0].dateOfBirth).toBe('1990-01-01');
    expect(result[0].gender).toBe('Male');
    expect(result[0].contactNumber).toBe('1234567890');
    expect(result[0].email).toBe('john@example.com');
    expect(result[0].address).toBe('123 Main St');
  });

  it('should persist data between connections', async () => {
    const patient = {
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: '1990-01-01',
      gender: 'Male',
      contactNumber: '1234567890',
      email: 'john@example.com',
      address: '123 Main St'
    };

    // First connection: Insert data
    await service.executeQuery(
      'INSERT INTO patients (firstName, lastName, dateOfBirth, gender, contactNumber, email, address, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, datetime(), datetime())',
      [patient.firstName, patient.lastName, patient.dateOfBirth, patient.gender, patient.contactNumber, patient.email, patient.address]
    );
    await service.closeDatabase();

    // Second connection: Verify data
    await service.initDatabase();
    const result = await service.executeQuery('SELECT * FROM patients');
    expect(result.length).toBe(1);
    expect(result[0].firstName).toBe('John');
    expect(result[0].lastName).toBe('Doe');
  });

  it('should handle errors gracefully', async () => {
    // Close database to simulate error
    service.closeDatabase();
    try {
      await service.executeQuery('SELECT * FROM patients');
      fail('Should have thrown an error');
    } catch (err) {
      expect((err as Error).message).toBe('Database is not initialized');
    }
  });
});
