import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import firebase from 'firebase/compat/app';
import { NewsletterSubscription, BoardSubscription } from '../interfaces/newsletter-subscription';

@Injectable({
  providedIn: 'root',
})
export class NewsletterService {
  constructor(private db: AngularFirestore) {}

  createSubscription(subscription: NewsletterSubscription): Promise<void> {
    return this.db.collection('newsletter-subscriptions').doc(subscription.email).set(subscription);
  }

  getSubscriptionByEmail(email: string): Observable<NewsletterSubscription | null> {
    return this.db
      .collection('newsletter-subscriptions')
      .doc<NewsletterSubscription>(email)
      .valueChanges()
      .pipe(map(subscription => subscription || null));
  }

  addBoardSubscription(email: string, boardSubscription: BoardSubscription): Promise<void> {
    return this.db.collection('newsletter-subscriptions').doc(email)
      .update({
        boardSubscriptions: firebase.firestore.FieldValue.arrayUnion(boardSubscription)
      });
  }

  sendNotificationToSubscribers(boardId: string, message: string): Promise<void> {
    return this.db.collection('newsletter-subscriptions').ref
      .get()
      .then(snapshots => {
        snapshots.forEach(doc => {
          const boardSubscription = (doc.data() as NewsletterSubscription).boardSubscriptions.find((boardSubscription: BoardSubscription) => boardSubscription.boardId === boardId);
          if (boardSubscription) {
            this.db.collection('mail').add({
              to: doc.id,
              message: {
                subject: 'An update has been published on a board you are subscribed to',
                html: `<p>${message}</p><p>Click <a href="https://mvp-roadmap.web.app/board/${boardId}">here</a> to see the update</p>`,
              },
            })
          }
        });
      });
  }



}
