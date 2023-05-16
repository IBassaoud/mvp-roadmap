import { animate, state, style, transition, trigger } from '@angular/animations';

export const growAnimation = trigger('grow', [
  state('start', style({ width: '0%' })),
  state('end', style({ width: '*' })),
  transition('start <=> end', animate('2s'))
]);
