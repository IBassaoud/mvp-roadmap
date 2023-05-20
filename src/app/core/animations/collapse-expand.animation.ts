import { animate, state, style, transition, trigger } from '@angular/animations';

export const collapseExpandAnimation = trigger('collapseExpand', [
  state(
    'expanded',
    style({
      height: '*',
      opacity: 1,
      padding: '*',
    })
  ),
  state(
    'collapsed',
    style({
      height: '0px',
      opacity: 0,
      padding: '0px',
    })
  ),
  transition('void => expanded', [
    style({
      height: '0px',
      opacity: 0,
      padding: '0px',
    }),
    animate('300ms')
  ]),
  transition('expanded => void', [
    animate('300ms', style({
      height: '0px',
      opacity: 0,
      padding: '0px',
    })),
  ]),
  transition('expanded <=> collapsed', [animate('300ms')]),
]);
