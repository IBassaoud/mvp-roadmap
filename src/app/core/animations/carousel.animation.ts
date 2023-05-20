import { trigger, transition, style, animate } from '@angular/animations';

export const slideInAnimation = trigger('slideIn', [
  transition(':increment', [
    style({ transform: 'translateX(100%)', opacity: 0 }),
    animate('500ms ease-out', style({ transform: 'translateX(0)', opacity: 1 })),
  ]),
  transition(':decrement', [
    style({ transform: 'translateX(-100%)', opacity: 0 }),
    animate('500ms ease-out', style({ transform: 'translateX(0)', opacity: 1 })),
  ]),
]);
