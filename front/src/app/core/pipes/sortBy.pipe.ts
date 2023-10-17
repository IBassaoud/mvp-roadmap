/*
 *ngFor="let c of oneDimArray | sortBy:'asc'"
 *ngFor="let c of arrayOfObjects | sortBy:'asc':'propertyName'"
*/
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'sortBy' })
export class SortByPipe implements PipeTransform {

  transform(value: any[], order = '', column1: string = '', column2: string = ''): any[] {
    return value.sort((a, b) => {
      if (order === "asc") {
        return a[column1][column2] - b[column1][column2];
      } else if (order === "desc") {
        return b[column1][column2] - a[column1][column2];
      }
      return 0;
    });
  }
}
