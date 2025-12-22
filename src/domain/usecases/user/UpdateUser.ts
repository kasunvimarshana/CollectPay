import {User} from '../../entities/User';
import {UserRepository} from '../../repositories/UserRepository';

export class UpdateUser {
  constructor(private repo: UserRepository) {}
  async execute(
    id: string,
    changes: Partial<Pick<User, 'name' | 'email'>>,
  ): Promise<User> {
    return this.repo.update(id, changes);
  }
}
