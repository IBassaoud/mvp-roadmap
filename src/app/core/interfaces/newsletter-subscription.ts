export interface BoardSubscription {
  boardId: string;
  subscriptionDate: Date;
}

export interface NewsletterSubscription {
  id?: string;
  email?: string;
  boardSubscriptions: BoardSubscription[];
}