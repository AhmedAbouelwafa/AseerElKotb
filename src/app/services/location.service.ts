import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../core/configs/environment.config';
import { Governorate, GovernoratesResponse } from '../models/governorate.model';
import { City, CitiesResponse } from '../models/city.model';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private governorateApiUrl = environment.apiBaseUrl + '/Governorates';
  private cityApiUrl = environment.apiBaseUrl + '/Cities';

  constructor(private http: HttpClient) { }

  /**
   * Get all governorates
   * @returns Observable of governorates list
   */
  getAllGovernorates(): Observable<Governorate[]> {
    console.log('LocationService: Getting all governorates');
    console.log('LocationService: API URL:', this.governorateApiUrl);
    
    return this.http.get<any>(this.governorateApiUrl).pipe(
      map(response => {
        console.log('LocationService: Raw governorates response:', response);
        console.log('LocationService: Response type:', typeof response);
        console.log('LocationService: Is Array:', Array.isArray(response));
        
        let governorates: Governorate[] = [];
        
        // Handle different response formats
        if (response && response.data && Array.isArray(response.data)) {
          // If response has 'data' property (wrapped response)
          console.log('LocationService: Using wrapped response format with data property');
          governorates = response.data;
        } else if (Array.isArray(response)) {
          // If response is directly an array
          console.log('LocationService: Using direct array response format');
          governorates = response;
        } else if (response && response.succeeded && response.data) {
          // If response has 'succeeded' flag (another common format)
          console.log('LocationService: Using API result format with succeeded flag');
          governorates = response.data;
        } else {
          // Try to extract data from other possible structures
          console.log('LocationService: Trying to extract data from unknown structure');
          if (response && typeof response === 'object') {
            // Look for arrays in the response
            const keys = Object.keys(response);
            for (const key of keys) {
              if (Array.isArray(response[key])) {
                console.log(`LocationService: Found array in property '${key}'`);
                governorates = response[key];
                break;
              }
            }
          }
        }
        
        console.log('LocationService: Processed governorates:', governorates);
        console.log('LocationService: Number of governorates:', governorates.length);
        
        // Fix the backend typo: "nmae" should be "name"
        governorates = governorates.map(gov => {
          if (gov.nmae && !gov.name) {
            console.log(`LocationService: Fixing typo for governorate ID ${gov.id}: "${gov.nmae}"`);
            return {
              id: gov.id,
              name: gov.nmae
            };
          }
          return gov;
        });
        
        console.log('LocationService: Fixed governorates:', governorates);
        
        // Validate the structure of the first item
        if (governorates.length > 0) {
          const firstGov = governorates[0];
          console.log('LocationService: First governorate structure:', firstGov);
          console.log('LocationService: Has id property:', 'id' in firstGov);
          console.log('LocationService: Has name property:', 'name' in firstGov);
        }
        
        return governorates;
      })
    );
  }

  /**
   * Get cities by governorate ID
   * @param governorateId The ID of the governorate
   * @returns Observable of cities list
   */
  getCitiesByGovernorate(governorateId: number): Observable<City[]> {
    console.log('LocationService: Getting cities for governorate ID:', governorateId);
    
    const url = `${this.cityApiUrl}/governorate/${governorateId}`;
    console.log('LocationService: Cities API URL:', url);
    
    return this.http.get<any>(url).pipe(
      map(response => {
        console.log('LocationService: Raw cities response:', response);
        console.log('LocationService: Cities response type:', typeof response);
        console.log('LocationService: Cities is Array:', Array.isArray(response));
        
        let cities: City[] = [];
        
        // Handle different response formats
        if (response && response.data && Array.isArray(response.data)) {
          // If response has 'data' property (wrapped response)
          console.log('LocationService: Using wrapped cities response format with data property');
          cities = response.data;
        } else if (Array.isArray(response)) {
          // If response is directly an array
          console.log('LocationService: Using direct array cities response format');
          cities = response;
        } else if (response && response.succeeded && response.data) {
          // If response has 'succeeded' flag (another common format)
          console.log('LocationService: Using API result cities format with succeeded flag');
          cities = response.data;
        } else {
          // Try to extract data from other possible structures
          console.log('LocationService: Trying to extract cities data from unknown structure');
          if (response && typeof response === 'object') {
            // Look for arrays in the response
            const keys = Object.keys(response);
            for (const key of keys) {
              if (Array.isArray(response[key])) {
                console.log(`LocationService: Found cities array in property '${key}'`);
                cities = response[key];
                break;
              }
            }
          }
        }
        
        console.log('LocationService: Processed cities:', cities);
        console.log('LocationService: Number of cities:', cities.length);
        
        // Fix the backend typo: "nmae" should be "name"
        cities = cities.map(city => {
          if (city.nmae && !city.name) {
            console.log(`LocationService: Fixing city typo for city ID ${city.id}: "${city.nmae}"`);
            return {
              id: city.id,
              name: city.nmae,
              governorateId: city.governorateId
            };
          }
          return city;
        });
        
        console.log('LocationService: Fixed cities:', cities);
        
        // Validate the structure of the first item
        if (cities.length > 0) {
          const firstCity = cities[0];
          console.log('LocationService: First city structure:', firstCity);
          console.log('LocationService: City has id property:', 'id' in firstCity);
          console.log('LocationService: City has name property:', 'name' in firstCity);
          console.log('LocationService: City has governorateId property:', 'governorateId' in firstCity);
        }
        
        return cities;
      })
    );
  }

  /**
   * Test method to create dummy data for debugging
   * @returns Observable of test governorates
   */
  getTestGovernorates(): Observable<Governorate[]> {
    console.log('LocationService: Using test governorates data');
    const testData: Governorate[] = [
      { id: 1, name: 'القاهرة' },
      { id: 2, name: 'الجيزة' },
      { id: 3, name: 'الإسكندرية' },
      { id: 4, name: 'الدقهلية' },
      { id: 5, name: 'الغربية' }
    ];
    return new Observable(observer => {
      setTimeout(() => {
        observer.next(testData);
        observer.complete();
      }, 1000); // Simulate API delay
    });
  }

  /**
   * Test method to create dummy cities for debugging
   * @param governorateId The governorate ID
   * @returns Observable of test cities
   */
  getTestCities(governorateId: number): Observable<City[]> {
    console.log('LocationService: Using test cities data for governorate:', governorateId);
    const testCities: { [key: number]: City[] } = {
      1: [ // Cairo
        { id: 1, name: 'وسط البلد', governorateId: 1 },
        { id: 2, name: 'مصر الجديدة', governorateId: 1 },
        { id: 3, name: 'مدينة نصر', governorateId: 1 }
      ],
      2: [ // Giza
        { id: 4, name: 'الجيزة', governorateId: 2 },
        { id: 5, name: '6 أكتوبر', governorateId: 2 },
        { id: 6, name: 'الشيخ زايد', governorateId: 2 }
      ],
      3: [ // Alexandria
        { id: 7, name: 'الإسكندرية', governorateId: 3 },
        { id: 8, name: 'المنتزة', governorateId: 3 }
      ]
    };
    
    return new Observable(observer => {
      setTimeout(() => {
        observer.next(testCities[governorateId] || []);
        observer.complete();
      }, 500);
    });
  }
}