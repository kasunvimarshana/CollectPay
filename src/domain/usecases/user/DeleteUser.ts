import {UserRepository} from '../../repositories/UserRepository';

export class DeleteUser {
  constructor(private repo: UserRepository) {}
  async execute(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
