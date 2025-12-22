import {User} from '../../entities/User';
import {UserRepository} from '../../repositories/UserRepository';

export class GetUsers {
  constructor(private repo: UserRepository) {}
  async execute(onChange?: (users: User[]) => void): Promise<User[]> {
    return this.repo.getAll(onChange);
  }
}
