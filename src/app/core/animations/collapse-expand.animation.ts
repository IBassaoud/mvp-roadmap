import { trigger, style, animate, transition, state, sequence, query, stagger, keyframes } from '@angular/animations';

export const collapseExpandAnimation = trigger('collapseExpand', [
  state('collapsed', style({ height: '0px', minHeight: '0', display: 'none' })),
  state('expanded', style({ height: '*' })),
  transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
])
