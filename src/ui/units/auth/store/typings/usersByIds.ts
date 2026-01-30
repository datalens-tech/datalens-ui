import type {UserSubject as PersonSubject} from 'shared/schema/auth/types/users';

type SystemSubject = {
    source: 'system';
    subject: {
        uid: string;
        login: string;
    };
};

type UserSubject = {
    source: 'user';
    subject: PersonSubject;
};

export type Subject = SystemSubject | UserSubject;

type User = {
    loading: boolean;
    data: Subject | null;
    error: Error | null;
};

export type UsersByIdsState = {
    queue: string[];
    users: {
        [userId: string]: User;
    };
};

export type PreparedUserById =
    | {
          status: 'loading';
      }
    | {
          status: 'error';
          error: Error;
      }
    | {
          status: 'resolved';
          id: string;
          login: string;
          data: Subject;
      };

export type UserByIdMap = {
    [userId: string]: PreparedUserById;
};
