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
}
