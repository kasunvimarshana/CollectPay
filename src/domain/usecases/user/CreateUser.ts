import {User} from '../../entities/User';
import {UserRepository} from '../../repositories/UserRepository';

export class CreateUser {
  constructor(private repo: UserRepository) {}
  async execute(input: {name: string; email: string}): Promise<User> {
    return this.repo.create({
      name: input.name,
      email: input.email,
      deleted: false,
    });
  }
}
